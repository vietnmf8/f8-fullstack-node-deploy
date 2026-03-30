const postService = require("@/services/post.service");

/* Lấy toàn bộ danh sách post */
const getAll = async (req, res) => {
    // Lấy ra page hiện tại
    const page = +req.query.page || 1;
    const result = await postService.pagination(page, 10, {
        user_id: req.query.user_id,
        // slug: "title-5",
    });
    res.paginate(result);
};

/* Lấy chi tiết 1 post */
const getOne = async (req, res) => {
    const post = await postService.findOne(req.params.id);
    console.log(post);

    if (!post) {
        return res.error(
            {
                message: `Tài nguyên không tồn tại ID: ${req.params.id}`,
            },
            404,
        );
    }

    res.success(post);
};

/* Tạo post mới */
const create = (req, res) => {};

module.exports = { getAll, getOne, create };
