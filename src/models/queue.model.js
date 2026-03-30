const { taskStatus } = require("@/configs/constants");
const pool = require("@/configs/database.config");

class Queue {
    /**
     *---
     ** Đẩy một công việc mới vào hàng đợi
     * @param {string} type - Loại job (VD: sendVerificationEmail)
     * @param {object} payload - Dữ liệu cần thiết để thực hiện job
     */
    async push(type, payload) {
        const jsonPayload = JSON.stringify(payload);
        const query = `INSERT INTO queues (type, payload) VALUES (?, ?)`;
        const [{ insertId }] = await pool.query(query, [type, jsonPayload]);
        return insertId;
    }

    /**
     *---
     ** Lấy từng job được xếp đầu tiên đang chờ xử lý
     */
    async getPendingTask() {
        const query = `SELECT * FROM queues WHERE status = ? ORDER BY id ASC LIMIT 1`;
        const [rows] = await pool.query(query, [taskStatus.pending]);
        return rows[0];
    }

    /**
     *---
     ** Cập nhật trạng thái của job
     * @param {string} id - id của job trong queues
     * @param {string} status - Trạng thái của job trong queues
     */
    async updateStatus(id, status, info) {
        const query = `UPDATE queues SET status = ?, info = ? WHERE id = ?`;
        await pool.query(query, [status, info, id]);
    }
}

module.exports = new Queue();
