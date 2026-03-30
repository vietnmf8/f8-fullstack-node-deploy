const prisma = require("@/libs/prisma");
const conversationModel = require("@/models/conversation.model");
const messageModel = require("@/models/message.model");
const userModel = require("@/models/user.model");
const {
    ConversationTypeError,
    TargetUserExistConversation,
    UserPermission,
    AuthError,
    NoContent,
} = require("@/utils/errors");

class ConversationService {
    /* Tạo cuộc hội thoại mới */
    async createConversation(data, creatorId) {
        const { name, type, participant_ids } = data;

        // Validate type
        if (!["group", "direct"].includes(type)) {
            throw new ConversationTypeError("Invalid conversation type");
            // Xử lý status 400 trong errorHandler
        }

        // Nếu là DM thì participant_ids chỉ có 1 người
        // Lấy ID của người đó
        const targetId = participant_ids?.[0];

        // Xử lý tìm DM đã tồn tại trước khi tạo mới
        if (type === "direct" && targetId) {
            // Tìm cuộc hội thoại DM mà cả 2 đều là thành viên
            const existingDM = await prisma.conversation.findFirst({
                where: {
                    type: "direct",
                    AND: [
                        {
                            // conversation có creatorId
                            conversation_participants: {
                                some: { user_id: creatorId },
                            },
                        },
                        {
                            // conversation có targetId
                            conversation_participants: {
                                some: { user_id: targetId },
                            },
                        },
                    ],
                },

                select: { id: true, name: true, type: true },
            });

            if (existingDM) return existingDM;
        }

        // 1. Tạo bản ghi conversation
        const conversation = await prisma.conversation.create({
            data: {
                name: name || null,
                type,
                created_by: creatorId,
            },
        });

        // 2. Thêm thành viên
        const participantIds = Array.from(
            new Set([creatorId, ...participant_ids]),
        );
        await prisma.conversationParticipants.createMany({
            data: participantIds.map((userId) => ({
                conversation_id: conversation.id,
                user_id: userId,
            })),
        });

        return { id: conversation.id, name, type };
    }

    /* Lấy danh sách các cuộc hội thoại của user */
    async getConversations(userId) {
        const conversations = await prisma.conversation.findMany({
            where: {
                conversation_participants: { some: { user_id: userId } },
            },
            include: {
                // Lấy tin nhắn mới nhất
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
                },
                // Lấy thông tin thành viên khác
                conversation_participants: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                },
            },
        });

        return conversations;
    }

    /* Thêm thành viên mới */
    async addParticipant(conversationId, targetUserId, currentUserId) {
        // Kiểm tra xem tồn tại Conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        // Nếu không có Conversation
        if (!conversation) {
            throw new ConversationTypeError("Conversation not found");
        }

        // Chỉ có thể thêm thành viên nếu Conversation là một NHÓM
        if (conversation.type !== "group") {
            throw new ConversationTypeError(
                "Can only add participants to group conversations",
            );
            // Status 400
        }

        // Kiểm tra xem user hiện tại có trong nhóm không?
        // Nếu có thì mới cho quyền thêm
        const isMember = await prisma.conversationParticipants.findFirst({
            where: {
                conversation_id: conversationId,
                user_id: currentUserId,
            },
        });

        if (!isMember) throw new UserPermission();

        // Kiểm tra user tồn tại
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, email: true, created_at: true },
        });

        if (!targetUser) {
            throw new AuthError("User not found");
        }

        // Kiểm tra target user đã trong nhóm chưa
        const isAlreadyMember = await prisma.conversationParticipants.findFirst(
            {
                where: {
                    conversation_id: conversationId,
                    user_id: targetUserId,
                },
            },
        );

        if (isAlreadyMember) {
            throw new TargetUserExistConversation();
        }

        // Thêm target user vào nhóm
        await prisma.conversationParticipants.create({
            data: {
                conversation_id: conversationId,
                user_id: targetUserId,
            },
        });
    }

    /* Gửi tin nhắn */
    async sendMessage(conversationId, senderId, content, type = "text") {
        // Báo lỗi khi gửi gửi tin nhắn rỗng
        if (!content || content.trim() === "") {
            throw new NoContent();
        }

        // Kiểm tra quyền thành viên
        await this.checkPermission(conversationId, senderId);

        // Tin nhắn
        const message = await prisma.message.create({
            data: {
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                type,
            },
            include: {
                user: { select: { id: true, email: true, name: true } },
            },
        });

        return message;
    }

    /* Lấy danh sách tin nhắn của một cuộc trò chuyện */
    async getMessages(
        conversationId,
        currentUserId,
        limit = 20,
        before = null,
    ) {
        // Kiểm tra quyền thành viên
        await this.checkPermission(conversationId, currentUserId);

        // Query
        const query = {
            where: { conversation_id: conversationId },
            take: limit + 1, // Lấy dư 1 để kiểm tra hasMore
            orderBy: { created_at: "desc" }, // Sắp xếp tin nhắn theo created_at tăng dần
            include: {
                // Mỗi tin nhắn phải kèm thông tin người gửi: id, email, name.
                user: { select: { id: true, email: true, name: true } },
            },
        };

        // Lấy các tin nhắn cũ
        if (before) {
            query.where.id = { lt: parseInt(before) };
        }

        const messages = await prisma.message.findMany(query);
        const hasMore = messages.length > limit;

        // Nếu có hasMore, xóa phần tử dư thừa
        const resultMessages = hasMore ? messages.slice(0, limit) : messages;

        // Đảo ngược lại để tin cũ ở trên, tin mới ở dưới cho Frontend
        return {
            messages: resultMessages.reverse(),
            hasMore,
        };
    }

    /* Hàm dùng chung kiểm tra quyền truy cập */
    async checkPermission(conversationId, userId) {
        // Bảo mật
        const isMember = await prisma.conversationParticipants.findFirst({
            where: {
                conversation_id: conversationId,
                user_id: userId,
            },
        });
        if (!isMember)
            throw new UserPermission("Bạn không có quyền trong hội thoại này");
    }
}

module.exports = new ConversationService();
