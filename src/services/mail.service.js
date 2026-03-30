const mailConfig = require("@/configs/mail.config");
const ejs = require("ejs");
const { transporter } = require("@/libs/nodemailer");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const authConfig = require("@/configs/auth.config");
const appConfig = require("@/configs/app.config");

class MailService {
    /* Lấy ra đường dẫn đầy đủ của templateHTML */
    getTemplatePath(template) {
        const templatePath = path.join(
            __dirname,
            "..",
            "resource",
            "mail",
            `${template.replace("ejs", "")}.ejs`,
        );

        return templatePath;
    }

    /* Lấy ra Template & Gửi email */
    async send(options) {
        const { template, templateData, ...restOptions } = options;
        const templatePath = this.getTemplatePath(template);

        // Render Template HTML
        const html = await ejs.renderFile(templatePath, templateData);

        // Gửi email
        const result = await transporter.sendMail({ ...restOptions, html });

        return result;
    }

    /* Tạo link Verify & Ký Token */
    generateVerificationLink(user) {
        const payload = {
            sub: user.id,
        };

        // Ký token
        const token = jwt.sign(payload, authConfig.verificationSecret, {
            expiresIn: authConfig.verificationTokenTTL,
        });

        // Tạo link
        const verificationLink = `${appConfig.url}/verify-email?token=${token}`;

        return verificationLink;
    }

    /* Gửi Email thông báo xác thực */
    async sendVerificationEmail(user) {
        // Cấu hình
        const { fromAddress, fromName } = mailConfig;
        const verificationLink = this.generateVerificationLink(user);
        const expiryHours = Math.floor(authConfig.verificationTokenTTL / 3600);

        // Gửi mail
        const result = await this.send({
            from: `"${fromName}" <${fromAddress}>`,
            to: user.email,
            subject: "Verification",
            template: "auth/verificationEmail",
            templateData: {
                verificationLink,
                expiryHours,
            },
        });

        return result;
    }

    /* Gửi Email thông báo thay đổi mật khẩu */
    async sendChangePasswordEmail(user) {
        const { fromAddress, fromName } = mailConfig;

        // Gửi email
        const result = await this.send({
            from: `"${fromName}" <${fromAddress}>`,
            to: user.email,
            subject: "Thông báo đổi mật khẩu",
            template: "auth/changePassword",
            templateData: {
                changeTime: new Date().toLocaleString(),
                supportLink: "https://f8.edu.vn/support",
            },
        });

        return result;
    }

    /* Gửi Email báo cáo */
    async sendBackupRepost(email, subject, backupFile) {
        const { fromAddress, fromName } = mailConfig;

        // Gửi email
        const result = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            subject,
            html: `
                <h1>Upload to Google Drive Successfully!</h1>
                <p>File backup: ${backupFile}</p>
                `,
        });

        return result;
    }
}

module.exports = new MailService();
