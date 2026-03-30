const pool = require("@/configs/database.config");

class ConversationModel {
    /* Tạo cuộc hội thoại mới */
    async create(name, type, createdBy) {
        const query = `INSERT INTO conversations (name, type, created_by) VALUES (?, ?, ?)`;
        const [{ insertId }] = await pool.query(query, [name, type, createdBy]);
        return insertId;
    }

    /* Lấy danh sách tất cả cuộc hội thoại của một user */
    async findByUserId(userId) {
        // Lấy ra danh sách conversation_id của user
        const subquery = `
            SELECT cp.conversation_id
            FROM conversation_participants cp
            WHERE cp.user_id = ?
        `;

        // Lấy ra record conversation tương ứng với conversation_id
        const query = `
            SELECT *
            FROM conversations c
            WHERE c.id IN (${subquery})
            ORDER BY c.created_at DESC
        `;

        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    /* Thêm thành viên vào cuộc hội thoại */
    async addParticipant(conversationId, userId) {
        const query = `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            conversationId,
            userId,
        ]);
        return insertId;
    }

    /* Kiểm tra xem user có trong hội thoại không? (bảo mật) */
    async isParticipant(conversationId, userId) {
        const query = `SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`;
        const [rows] = await pool.query(query, [conversationId, userId]);
        return rows.length > 0;
    }

    /* Lấy 1 cuộc hội thoại theo ID */
    async findById(conversationId) {
        const query = `SELECT * FROM conversations WHERE id = ? LIMIT 1`;
        const [rows] = await pool.query(query, [conversationId]);
        return rows[0] || null;
    }
}

module.exports = new ConversationModel();
