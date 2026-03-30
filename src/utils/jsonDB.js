const fs = require("node:fs");
const filePath = "./db.json";

/* Đọc file */
function read() {
    try {
        const result = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(result);
    } catch (error) {
        if (error.code === "ENOENT") {
            const defaultDB = {};
            save(defaultDB);
            return defaultDB;
        }
    }
}

/* Ghi file */
function save(db) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf-8");
    } catch (error) {
        console.log(error);
    }
}

/* Export */
module.exports = { read, save };
