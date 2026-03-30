const pool = require("@/configs/database.config");

class RefreshToken {
    /* Thêm Refresh Token */
    async addRefreshToken(userId, token, userAgent, expiresIn) {
        const query = `INSERT INTO refresh_tokens (user_id, token, user_agent, expires_at) VALUE (?, ?, ?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            userId,
            token,
            userAgent,
            expiresIn,
        ]);
        return insertId;
    }

    /* Lấy ra Refresh Token từ DB */
    async findByRefreshToken(token) {
        const query = `SELECT id, user_id FROM refresh_tokens WHERE token = ? AND expires_at >= now() AND is_revoked = 0 LIMIT 1;`;
        const [rows] = await pool.query(query, [token]);
        return rows[0];
    }

    /* Revoke Old Refresh Token */
    async updateRefreshToken(id) {
        const query = `UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?`;
        const [{ affectedRows }] = await pool.query(query, [id]);
        return affectedRows;
    }

    /* Đếm bản ghi có token trong Blacklist */
    async countRefreshToken(token) {
        const query = `SELECT count(*) as count FROM refresh_tokens WHERE token = ?`;
        const [[{ count }]] = await pool.query(query, [token]);
        return count;
    }
}

module.exports = new RefreshToken();
