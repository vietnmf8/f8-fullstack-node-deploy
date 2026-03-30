const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("@/../generated/prisma");
const dbConfig = require("@/configs/db.config");

/* Cấu hình adapter */
const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port || 3306,
});

/* Cập nhật số lượng bài Post của User */
async function updatePostsCount(userId) {
    // Đếm số lượng bài Post của user đó trong DB hiện tại
    const postsCount = await prisma.post.count({
        where: { user_id: userId },
    });

    // Đếm lại bài post của toàn bộ User
    // await rebuildPostsCount();

    // Cập nhật vào field của bảng User
    await prisma.user.update({
        where: { id: userId },
        data: { posts_count: postsCount },
    });
}

/* Đếm lại bài post của toàn bộ User */
async function rebuildPostsCount() {
    const counts = await prisma.post.groupBy({
        by: ["user_id"],
        _count: true,
    });

    await Promise.all(
        counts.map((item) =>
            prisma.user.update({
                where: { id: item.user_id },
                data: { posts_count: item._count },
            }),
        ),
    );
}

/* Interceptor */
/** @type {import('../../generated/prisma').PrismaClient} */
const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        post: {
            /* Khi record mới được tạo! */
            async create({ args, query }) {
                // Bản ghi đã được tạo
                const result = await query(args);

                // Cập nhật số lượng bài Post của User
                await updatePostsCount(result.user_id);
                return result;
            },

            /* Khi record bị xoá! */
            async delete({ args, query }) {
                const result = await query(args);
                await updatePostsCount(result.user_id);
                return result;
            },
        },
    },
});

module.exports = prisma;
