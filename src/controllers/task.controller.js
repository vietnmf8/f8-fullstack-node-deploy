const taskModel = require("@/models/task.model");

/* Lấy toàn bộ danh sách Task */
const getAll = (req, res) => {
    const tasks = taskModel.findAll();
    res.success(tasks);
};

/* Lấy chi tiết 1 task */
const getOne = (req, res) => {
    res.success("Details");
};

/* Tạo task mới */
const create = (req, res) => {
    const newTask = taskModel.create({
        title: req.body.title,
    });
    res.success(newTask, 201);
};

/* Xoá 1 task */
const destroy = (req, res) => {
    //todo: Logic xoá task
};

module.exports = { getAll, getOne, create, destroy };
