const pool = require("@/configs/database.config");

class User {
    /* Tìm tất cả bản ghi */
    async findAll(limit, offset) {
        const query = `select * from users limit ? offset ?;`;
        const [rows] = await pool.query(query, [limit, offset]);
        return rows;
    }

    /* Đếm bản ghi */
    async count() {
        const query = `SELECT count(*) as count FROM users`;
        const [rows] = await pool.query(query);
        return rows[0].count;
    }

    /* Tìm một bản ghi */
    async findOne(id) {
        const query = `SELECT id, email, password, created_at FROM users WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    /* Tìm user theo Email */
    async findByEmail(email) {
        const query = `SELECT id, email, password, email_verified_at FROM users WHERE email = ?`;
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }

    /* Tạo bản ghi */
    async create(email, password) {
        const query = `INSERT INTO users (email, password) values (?, ?)`;
        const [{ insertId }] = await pool.query(query, [email, password]);
        return insertId;
    }

    /* Tìm kiếm user theo email để thêm vào conversation */
    async searchByEmail(queryStr, currentUserId) {
        const query = `
        SELECT id, email FROM users
        WHERE email LIKE ? AND id != ?
        LIMIT 10
    `;
        const [rows] = await pool.query(query, [
            `%${queryStr}%`,
            currentUserId,
        ]);
        return rows;
    }

    /* Cập nhật trạng thái xác thực email */
    async updateVerifyEmail(id) {
        const query = `UPDATE users SET email_verified_at = now() WHERE id = ?`;
        await pool.query(query, [id]);
    }

    /* Lấy ra user đã verify email */
    async findByVerifyEmail(id) {
        const query = `SELECT count(*) AS count FROM users WHERE id = ? AND email_verified_at IS NOT NULL`;
        const [[{ count }]] = await pool.query(query, [id]);
        return count;
    }

    /* Cập nhật mật khẩu mới */
    async updatePassword(id, hashedPassword) {
        const query = `UPDATE users SET password = ? WHERE id = ?`;
        await pool.query(query, [hashedPassword, id]);
    }
}

module.exports = new User();
