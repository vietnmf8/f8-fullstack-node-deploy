const crypto = require("node:crypto");

/* Hàm sinh một chuỗi ký tự ngẫu nhiên */
function randomString(size = 32, encoding = "hex") {
    const buffer = crypto.randomBytes(size);
    const keyHex = buffer.toString(encoding);
    return keyHex;
}

module.exports = randomString;
