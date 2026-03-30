const pool = require("@/configs/database.config");

class RevokedToken {
    /* Thêm Access Token vào Blacklist */
    async addRevokeToken(token, expiresIn) {
        const query = `INSERT INTO revoked_tokens (token, expires_at) VALUE (?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            token,
            new Date(expiresIn * 1000),
        ]);
        return insertId;
    }

    /* Đếm bản ghi có token trong Blacklist */
    async countRevokedToken(token) {
        const query = `SELECT count(*) as count FROM revoked_tokens WHERE token = ?`;
        const [[{ count }]] = await pool.query(query, [token]);
        return count;
    }

    /* Xoá revoked token */
    async deleteRevokeToken() {
        const query = `DELETE from revoked_tokens where expires_at < now()`;
        const [{ affectedRows }] = await pool.query(query);
        return affectedRows;
    }
}

module.exports = new RevokedToken();
