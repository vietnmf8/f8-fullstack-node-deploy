const mailService = require("@/services/mail.service");

async function sendVerificationEmail(payload) {
    // Gửi email xác thực cho user
    await mailService.sendVerificationEmail(payload);
}

module.exports = sendVerificationEmail;
