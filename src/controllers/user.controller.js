const postModel = require("@/models/post.model");
const userModel = require("@/models/user.model");
const userService = require("@/services/user.service");
const userTransformer = require("@/transformers/user.transformer");

/* Lấy toàn bộ danh sách user */
const getAll = async (req, res) => {
    const users = await userService.findAll();
    const result = userTransformer.transform(users);
    res.success(result);
};

/* Lấy toàn bộ danh sách posts của 1 user cụ thể */
const getUserPosts = async (req, res) => {
    const userPosts = await postModel.findUserPosts(req.params.id);
    res.success(userPosts);
};

/* Lấy chi tiết 1 user */
const getOne = async (req, res) => {
    const user = await userService.findOne(req.params.id);

    if (!user) {
        return res.error(
            {
                message: `Tài nguyên không tồn tại ID: ${req.params.id}`,
            },
            404,
        );
    }

    res.success(user);
};

/* Tạo user mới */
const create = (req, res) => {};

/* Tìm kiếm user theo email */
const search = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.success([]);

    const users = await userModel.searchByEmail(q, req.user.id);
    res.success(users);
};

module.exports = { getAll, getOne, create, getUserPosts, search };
