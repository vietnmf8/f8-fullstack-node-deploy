class UserTransformer {
    /* Lấy toàn bộ danh sách User */
    transform(users) {
        const response = users.map((user) => {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                posts: user.posts,
                posts_count: user.posts_count,
            };
        });
        return response;
    }
}

module.exports = new UserTransformer();
