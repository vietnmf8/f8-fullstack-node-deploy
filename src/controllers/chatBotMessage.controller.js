const { chatRole } = require("@/configs/constants");
const chatBotMessagesService = require("@/services/chatBotMessages.service");

/* Lấy lịch sử tin nhắn */
const getMessages = async (req, res) => {
    const user = req.auth.user;
    const { before, limit } = req.query;

    const result = await chatBotMessagesService.getMessages(user, {
        before: before ? parseInt(before) : null,
        limit: limit ? parseInt(limit) : 20,
    });

    res.success(result);
};

/* Chat */
const chat = async (req, res) => {
    // Prompt từ user
    const input =
        typeof req.body?.input === "string" ? req.body.input.trim() : "";
    if (!input) return res.error("Invalid input", 400);
    const user = req.auth.user;

    const result = await chatBotMessagesService.chat(user, input);

    res.success({
        role: chatRole.assistant,
        content: result,
    });
};

module.exports = { chat, getMessages };
