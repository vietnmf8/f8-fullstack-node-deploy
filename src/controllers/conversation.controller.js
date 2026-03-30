const { httpCodes } = require("@/configs/constants");
const pusher = require("@/libs/pusher");
const conversationService = require("@/services/conversation.service");
const conversationTransformer = require("@/transformers/conversation.transformer");
const messageTransformer = require("@/transformers/message.transformer");

/* Tạo cuộc hội thoại mới */
const create = async (req, res) => {
    const currentUserId = req.auth.user.id;
    const result = await conversationService.createConversation(
        req.body,
        currentUserId,
    );
    res.success(result, httpCodes.created);
};

/* Lấy danh sách conversation của user hiện tại */
const getAll = async (req, res) => {
    const conversations = await conversationService.getConversations(
        req.auth.user.id,
    );
    const result = conversationTransformer.transformMany(conversations);
    res.success(result);
};

/* Thêm thành viên mới vào nhóm */
const addParticipant = async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const { user_id } = req.body;
    const currentUserId = req.auth.user.id;
    await conversationService.addParticipant(
        conversationId,
        user_id,
        currentUserId,
    );
    res.success({ message: "Đã thêm thành viên thành công!" });
};

/* Gửi tin nhắn */
const sendMessage = async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const senderId = req.auth.user.id;
    const { type, content } = req.body;
    const message = await conversationService.sendMessage(
        conversationId,
        senderId,
        content,
        type,
    );

    // Bắn tin realtime
    const result = messageTransformer.transform(message);
    pusher.trigger(`conversation-${conversationId}`, "created", result);
    res.success(result, httpCodes.created);
};

/* Lấy lịch sử tin nhắn */
const getMessages = async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const currentUserId = req.auth.user.id;
    const { limit, before } = req.query;

    const { messages, hasMore } = await conversationService.getMessages(
        conversationId,
        currentUserId,
        parseInt(limit) || 20,
        before,
    );
    res.success({
        messages: messageTransformer.transformMany(messages),
        hasMore,
    });
};

module.exports = { create, getAll, addParticipant, sendMessage, getMessages };
