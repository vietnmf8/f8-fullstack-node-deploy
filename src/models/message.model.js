const pool = require("@/configs/database.config");

class MessageModel {
    /* Lưu tin nhắn mới */
    async create(conversationId, senderId, content) {
        const query = `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            conversationId,
            senderId,
            content,
        ]);
        return insertId;
    }

    /* Lấy toàn bộ tin nhắn trong 1 cuộc hội thoại, kèm thông tin người gửi */
    async findByConversationId(conversationId) {
        // // Lấy email người gửi (dựa vào sender_id của messages)
        // const senderEmailSubquery = `
        //     SELECT u.email
        //     FROM users u
        //     WHERE u.id = m.sender_id
        // `;

        // const query = `
        //     SELECT m.*, (${senderEmailSubquery}) AS sender_email
        //     FROM messages m
        //     WHERE m.conversation_id = ?
        //     ORDER BY m.created_at DESC
        // `;

        const query = `
        SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at, u.id as sender_id, u.email as sender_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at DESC
    `;

        const [rows] = await pool.query(query, [conversationId]);
        const result = rows.map((row) => ({
            id: row.id,
            conversation_id: row.conversation_id,
            sender: {
                id: row.sender_id,
                email: row.sender_email,
            },
            content: row.content,
            created_at: row.created_at,
        }));

        return result;
    }
}

module.exports = new MessageModel();
