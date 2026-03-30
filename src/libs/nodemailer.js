const mailConfig = require("@/configs/mail.config");
const nodemailer = require("nodemailer");

/* Gửi mail */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mailConfig.fromAddress,
        pass: mailConfig.appPassword,
    },
});

module.exports = { transporter };
