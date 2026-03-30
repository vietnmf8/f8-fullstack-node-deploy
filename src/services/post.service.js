const paginationService = require("./pagination.service");
const prisma = require("@/libs/prisma");

class PostService {
    constructor() {
        // Thêm phương thức mới vào instance riêng biệt
        paginationService.apply(this);
    }

    /* Đếm tất cả bài Post */
    async count(condition = {}) {
        const where = Object.fromEntries(
            Object.entries(condition).filter(
                ([_, value]) => value !== undefined,
            ),
        );

        return await prisma.post.count({ where });
    }

    /* Lấy ra danh sách bài Post */
    async findAll(limit, offset, condition = {}) {
        // Lọc bỏ các giá trị undefined từ condition
        const where = Object.fromEntries(
            Object.entries(condition).filter(
                ([_, value]) => value !== undefined,
            ),
        );

        const posts = await prisma.post.findMany({
            where,
            take: limit,
            skip: offset,
        });

        return posts;
    }

    /* Lấy chi tiết 1 bài Post */
    async findOne(id) {
        const post = await prisma.post.findUniqueOrThrow({
            select: {
                id: true,
                title: true,
                content: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        created_at: true,
                        updated_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            where: {
                id: parseInt(id),
            },
        });

        return post;
    }
}

// Khởi tạo object và export object đó ra
module.exports = new PostService();
