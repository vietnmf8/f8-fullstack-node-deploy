const { readdirSync } = require("node:fs");

/* 
1. Cứ field `type` (DB) nào được đẩy vào queue
2. Lấy file trùng tên trong thư mục tasks để xử lý
*/

const tasks = readdirSync(__dirname)
    .filter((fileName) => fileName !== "index.js")
    .reduce((obj, fileName) => {
        const type = fileName.replace(".task.js", "");
        return {
            ...obj,
            [type]: require(`./${fileName}`),
        };
    }, {});

module.exports = tasks;
