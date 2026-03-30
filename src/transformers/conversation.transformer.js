class ConversationTransformer {
    /* Lấy toàn bộ danh sách hội thoại */
    transformMany(conversations) {
        return conversations
            .map((conv) => this.transform(conv))
            .sort((a, b) => {
                const timeA = a.lastMessage?.created_at || 0;
                const timeB = b.lastMessage?.created_at || 0;
                return new Date(timeB) - new Date(timeA);
            });
    }

    /* Lấy một tin nhắn */
    transform(conv) {
        return {
            id: conv.id,
            name: conv.name,
            type: conv.type,
            lastMessage: conv.messages[0] || null,
            participants: conv.conversation_participants.map((p) => p.user),
        };
    }
}

module.exports = new ConversationTransformer();
