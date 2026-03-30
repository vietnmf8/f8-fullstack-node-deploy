const path = require("path");
const { exec } = require("child_process");
const fs = require("fs").promises;
const util = require("util");
const execAsync = util.promisify(exec);
const prisma = require("@/libs/prisma");
const aiService = require("./ai.service");
const { chatRole } = require("@/configs/constants");
const { chatbotResponseFormat } = require("@/configs/ai.config");

// Mọi thứ chỉ được phép xảy ra trong thư mục này thôi
const WORKSPACE = path.resolve(process.cwd());

// Convert giá trị raw kiểu win32, darwin → tên dễ hiểu hơn
const PLATFORM =
    { darwin: "macOS", win32: "Windows", linux: "Linux" }[process.platform] ??
    process.platform;

// Chỉ cho phép AI chạy một số lệnh an toàn
const BASH_WHITELIST =
    process.platform === "win32"
        ? /^(dir|cd|ver|whoami)(\s|$)/i
        : /^(ls|pwd|uname|df|whoami)(\s|$)/;

// Giới hạn số lần Thinking của AI
const MAX_TURNS = 50;

// Giới hạn số message giữ lại trong context
const CONTEXT_LIMIT = 50;

class ChatbotMessageService {
    /* Lấy ra lịch sử tin nhắn */
    async getMessages(user, { before, limit = 20 }) {
        const where = { user_id: user.id };
        if (before) {
            where.id = { lt: parseInt(before) };
        }

        const rows = await prisma.chatBotMessage.findMany({
            where,
            take: limit + 1,
            orderBy: { id: "desc" },
        });

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;
        items.reverse();

        return {
            messages: items.map((m) => ({
                id: m.id,
                role: m.type,
                content: m.content,
            })),
            hasMore,
            cursor: hasMore ? items[0].id : null,
        };
    }

    /* Chat với AI */
    async chat(user, input) {
        // Lấy ra toàn bộ ngữ cảnh, lịch sử Context chat
        const context = await this.buildContext(user.id);

        // Lấy ra System Prompt
        const systemPrompt = this.getSystemPrompt();

        // Lưu Message của User vào DB
        await this.saveMessage(user.id, chatRole.user, input);

        // Lưu lại lịch sử Thinking của AI Chatbot
        const toolHistory = [];

        // Kết quả trả về cuối cùng của AI Chatbot
        let response = "";

        // AI Chatbot đang trong quá trình suy nghĩ
        for (let i = 0; i < MAX_TURNS; i++) {
            // Lấy toàn bộ lịch sử chat + thinking
            const messages = [...context, ...toolHistory];

            // Lần suy nghĩ đầu tiên, đưa message của User vào mảng
            if (i === 0) messages.push({ role: chatRole.user, content: input });

            // Kết quả Thinking của AI Chatbot (Chưa phải là kết quả cuối cùng)
            const result = await this.think(systemPrompt, messages);

            // Lưu những lần thinking vào lịch sử thinking
            toolHistory.push({
                role: chatRole.assistant,
                content: JSON.stringify(result),
            });

            // Lấy ra HÀNH ĐỘNG + DỮ LIỆU từ kết quả suy nghĩ của AI chatbot
            const { action, payload } = result;

            // Nếu trả lời thành công (Không có hành động)
            if (action === "respond") {
                // Kết quả cuối cùng AI chatbot trả về cho User chính là DỮ LIỆU từ AI chatbot sau khi thinking
                response = payload?.message ?? "";
                break;
            }

            // Thực hiện hành động (nếu có)
            const toolOutput = await this.runTool(action, payload);

            // Lưu kết quả thực thi hành động vào context thinking
            toolHistory.push({ role: chatRole.user, content: toolOutput });
        }

        // Câu trả lời cuối cùng của AI Chatbot
        const finalResponse =
            response || "Unable to complete. Please try again.";

        // Lưu câu trả lời của AI Chatbot vào Context cuộc hội thoại
        await this.saveMessage(user.id, chatRole.assistant, finalResponse);

        // Trả về câu trả lời đó
        return finalResponse;
    }

    /* Lấy ra System Prompt */
    getSystemPrompt() {
        return `
            # SYSTEM PROMPT — F8 Mimi

## Môi trường
- OS: ${PLATFORM}
- bash: ${process.platform === "win32" ? "dùng dir, cd, ver, whoami (cmd)" : "dùng ls, pwd, uname, df, whoami"}

## Vai trò
Bạn là AI agent hỗ trợ lập trình trong môi trường workspace. Bạn có quyền:
- Đọc/ghi file trong workspace
- Chạy lệnh hệ thống (ls, pwd, uname, df, whoami)
- Trả lời câu hỏi về code, khóa học, lộ trình học lập trình

## Nguyên tắc
1. Chỉ thực hiện đúng yêu cầu user, không làm thừa
2. Path luôn tương đối với workspace (vd: package.json, src/index.js)
3. Khi dùng read_file: trả nội dung đầy đủ, format code đúng (vd: \`\`\`js cho file .js)
4. Khi dùng bash: ${process.platform === "win32" ? "chỉ dùng dir, cd, ver, whoami" : "chỉ dùng ls, pwd, uname, df, whoami"} — không đọc file qua bash
5. Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt

## Tools
- read_file: { "path": "<path>" }
- write_file: { "path": "<path>", "content": "<content>" }
- bash: { "command": "<${process.platform === "win32" ? "dir|cd|ver|whoami" : "ls|pwd|uname|df|whoami"}>" }
- respond: { "message": "<nội dung trả lời>" } — dùng khi kết thúc

## Output format
Luôn trả JSON thuần: { "action": "<tool>", "payload": {...} }
Không bọc \`\`\`json, không thêm text. Escape ký tự đặc biệt trong message (\\\\n, \\\\").`;
    }

    /* Lấy toàn bộ Context (Ngữ cảnh) của User với AI Chatbot */
    async buildContext(userId) {
        const rows = await prisma.chatBotMessage.findMany({
            where: { user_id: userId },
            take: CONTEXT_LIMIT,
            orderBy: { created_at: "desc" },
        });

        // Format định dạng ngữ cảnh với OpenAI
        return rows
            .reverse()
            .map((m) => ({ role: m.type, content: m.content }));
    }

    /* Lưu message chat vào DB */
    async saveMessage(userId, role, content) {
        return await prisma.chatBotMessage.create({
            data: { user_id: userId, type: role, content },
        });
    }

    /* AI Suy nghĩ / Trả lời */
    async think(systemPrompt, messages) {
        // Dữ liệu thô do AI trả về
        const raw = await aiService.completions(systemPrompt, messages, {
            responseFormat: chatbotResponseFormat,
        });

        try {
            // Trả về dạng Object JS
            return JSON.parse(raw);
        } catch (error) {
            throw new Error("Invalid AI response format");
        }
    }

    /* Tool: Các hành động huấn luyện của AI Chatbot */
    async runTool(action, payload) {
        // List các hành động
        const handlers = {
            // Tool thực hiện chạy lệnh CLI
            // Trả về kết quả từ dòng lệnh
            bash: () =>
                this.runCommand(payload?.command).then(
                    (out) => `Command output: ${out}`,
                ),

            // Tool đọc file
            // Trả về Message: nội dung (content) trong file
            read_file: () =>
                this.readFile(payload?.path).then(
                    (c) => `File content of ${payload?.path}: ${c}`,
                ),

            // Tool ghi file
            write_file: () =>
                this.writeFile(payload?.path, payload?.content ?? ""),
        };

        // Thực hiện 1 hành động cụ thể
        const handler = handlers[action];
        return handler
            ? handler()
            : "Error: Unknown action. Use respond to reply.";
    }

    /* Tool: CLI Command */
    async runCommand(command) {
        // Nếu command không an toàn
        if (
            !command ||
            typeof command !== "string" ||
            !BASH_WHITELIST.test(command.trim())
        ) {
            return "Error: Command not allowed";
        }

        // Thực thi command chỉ ở trong dự án hiện tại
        try {
            const { stdout } = await execAsync(command.trim(), {
                cwd: WORKSPACE,
            });
            return stdout.trim();
        } catch (error) {
            return error.message;
        }
    }

    /* Tool: Đọc file */
    async readFile(filePath) {
        // Lấy ra đường dẫn tuyệt đối đầy đủ
        const full = this.resolvePath(filePath);
        if (!full) return "Error: Invalid path";

        try {
            // Thực hiện đọc file
            return await fs.readFile(full, "utf-8");
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    /* Hàm chỉ cho phép truy cập file nằm trong thư mục (Validate Path) */
    resolvePath(filePath) {
        if (!filePath || typeof filePath !== "string") return null;
        const full = path.resolve(WORKSPACE, filePath);
        const base = path.resolve(WORKSPACE);
        if (full !== base && !full.startsWith(base + path.sep)) return null;
        return full;
    }

    /* Tool: Ghi file */
    async writeFile(filePath, content) {
        // Lấy ra đường dẫn tuyệt đối đầy đủ
        const full = this.resolvePath(filePath);
        if (!full) return "Error: Invalid path";

        // Thực hiện ghi file
        try {
            await fs.writeFile(full, content);

            // Trả về Message thông báo ghi file thành công!
            return `File written successfully: ${filePath}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

module.exports = new ChatbotMessageService();
