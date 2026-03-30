// Nhiệm vụ của model: Thực hiện làm việc trực tiếp với DB

/* Database */
const db = {
    tasks: [
        {
            id: 1,
            title: "Nấu cơm",
        },
        {
            id: 2,
            title: "Rửa bát",
        },
    ],
};

/**
 * Lấy ra danh sách task
 */
const findAll = () => {
    return db.tasks;
};

/**
 * Tạo 1 task mới
 * @param data: Chính là chuỗi JSON payload khi người dùng POST
 * VD: {
 *      title: "Quét nhà"
 * }
 */
const create = (data) => {
    const maxId = Math.max(...db.tasks.map((t) => t.id));
    const newTask = {
        id: maxId + 1,
        ...data,
    };
    db.tasks.push(newTask);
    return newTask;
};

module.exports = { create, findAll };
