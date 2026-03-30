const pool = require("@/configs/database.config");

class Post {
    async findAll(limit, offset, condition = {}) {
        const queryStr = Object.entries(condition)
            .filter(([_, value]) => value !== undefined) // void 0 --> lọc giá trị undefined | vẫn chấp nhận giá trị 0
            .map(([key, value]) => {
                value = typeof value === "number" ? value : `"${value}"`;
                return `${key}=${value}`;
            })
            .join(" and ");

        const [rows] = await pool.query(
            `select * from posts${queryStr ? ` where ${queryStr}` : ""} limit ${limit} offset ${offset};`,
        );

        return rows;
    }

    // Tìm toàn bộ bài posts của một user cụ thể
    async findUserPosts(userId) {
        const query = `SELECT * FROM posts WHERE id in (SELECT post_id FROM user_post WHERE user_id = ${userId})`;
        const [rows] = await pool.query(query);
        return rows;
    }

    async count() {
        const [rows] = await pool.query(`SELECT count(*) as count FROM posts`);
        return rows[0].count;
    }

    async findOne(id) {
        const [rows] = await pool.query(`SELECT * FROM posts WHERE id = ${id}`);

        return rows[0];
    }
}

module.exports = new Post();
