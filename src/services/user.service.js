const prisma = require("@/libs/prisma");

class UserService {
    /* Lấy ra danh sách của User */
    async findAll() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                score: true,
                posts: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                    },
                },
                posts_count: true,
                email_verified_at: true,
                created_at: true,
            },
        });

        return users;
    }

    /* Lấy ra một User cụ thể */
    async findOne(id) {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        return user;
    }
}

// Khởi tạo object và export object đó ra
module.exports = new UserService();
