const mailService = require("@/services/mail.service");

async function sendChangePasswordEmail(payload) {
    // Gửi email xác thực cho user
    await mailService.sendChangePasswordEmail(payload);
}

module.exports = sendChangePasswordEmail;
