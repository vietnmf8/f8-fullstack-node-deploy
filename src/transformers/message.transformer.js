class MessageTransformer {
    /* Lấy toàn bộ danh sách tin nhắn */
    transformMany(messages) {
        return messages.map((m) => this.transform(m));
    }

    /* Lấy một tin nhắn */
    transform(m) {
        return {
            id: m.id,
            conversation_id: m.conversation_id,
            sender: {
                id: m.user.id,
                email: m.user.email,
                name: m.user.name,
            },
            type: m.type,
            content: m.content,
            created_at: m.created_at,
        };
    }
}

module.exports = new MessageTransformer();
