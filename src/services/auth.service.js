const authConfig = require("@/configs/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("@/models/user.model");
const randomString = require("@/utils/randomString");
const refreshTokenModel = require("@/models/refreshToken.model");
const revokedTokenModel = require("@/models/revokedToken.model");
const {
    EmailExistError,
    AuthError,
    ValidateError,
    VerifyEmailError,
    PasswordError,
    EmailVerifyError,
} = require("@/utils/errors");
const queueService = require("./queue.service");
const { passwordErrors } = require("@/configs/constants");

class AuthService {
    /* Ký Token */
    async signAccessToken(user) {
        const payload = {
            sub: user.id,
        };
        const accessToken = jwt.sign(payload, authConfig.secret, {
            expiresIn: authConfig.accessTokenTTL,
        });

        return accessToken;
    }

    /* Tạo Refresh Token */
    async createRefreshToken(user, userAgent) {
        // Check trùng Refresh Token trong DB
        let refreshToken,
            isExists = false;
        do {
            refreshToken = randomString();
            const count =
                await refreshTokenModel.countRefreshToken(refreshToken);
            isExists = count > 0;
        } while (isExists);

        // Thời gian sống của Refresh Token
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + authConfig.refreshTokenTTL);

        // Thêm vào DB
        await refreshTokenModel.addRefreshToken(
            user.id,
            refreshToken,
            userAgent,
            expiresDate,
        );
        return refreshToken;
    }

    /* Verify */
    async verifyAccessToken(accessToken) {
        const payload = jwt.verify(accessToken, authConfig.secret);
        return payload;
    }

    /* Mã hóa mật khẩu người dùng */
    async hashPassword(password) {
        return await bcrypt.hash(password, authConfig.saltRounds);
    }

    /* Kiểm tra mật khẩu người dùng nhập vào */
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /* Ký token mới (Access & Refresh Token) */
    async responseWithTokens(user, userAgent) {
        const accessToken = await this.signAccessToken(user);
        const refreshToken = await this.createRefreshToken(user, userAgent);

        const tokens = {
            access_token: accessToken,
            access_token_ttl: authConfig.accessTokenTTL,
            refresh_token: refreshToken,
            refresh_token_ttl: authConfig.refreshTokenTTL,
        };

        return tokens;
    }

    /* Đăng ký */
    async register(email, password, userAgent) {
        // Kiểm tra email đã tồn tại chưa?
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) throw new EmailExistError("Email already exists!!");

        // Validate Email
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Validate Password
        function validatePassword(password) {
            return password && password.length >= 6;
        }

        // Thông báo lỗi nếu Validate thất bại
        if (!validateEmail(email) || !validatePassword(password))
            throw new ValidateError("Invalid email or password");

        // Mã hoá mật khẩu
        const hashedPassword = await this.hashPassword(password);
        const userId = await userModel.create(email, hashedPassword);

        // Thông tin user mới
        const newUser = {
            id: userId,
            email,
        };

        // Đẩy job gửi mail vào hàng đợi (Xử lý bất đồng bộ)
        // Không bắt người dùng chờ gửi mail xong mới đăng ký
        await queueService.push("sendVerificationEmail", newUser);

        // Tạo Token
        const tokens = await this.responseWithTokens(newUser, userAgent);
        return { newUser, tokens };
    }

    /* Đăng nhập */
    async login(email, password, userAgent) {
        const user = await userModel.findByEmail(email);

        // Kiểm tra người dùng đã tồn tại chưa?
        if (!user) {
            throw new AuthError();
        }

        // Kiểm tra mật khẩu hợp lệ?
        const isValid = await this.comparePassword(password, user.password);
        if (!isValid) {
            throw new AuthError();
        }

        // Kiểm tra Verify email
        if (!user.email_verified_at) {
            throw new EmailVerifyError();
        }

        const tokens = await this.responseWithTokens(user, userAgent);
        return { user, tokens };
    }

    /* Refresh */
    async refresh(refreshToken, userAgent) {
        const refreshTokenDB =
            await refreshTokenModel.findByRefreshToken(refreshToken);
        if (!refreshTokenDB) {
            throw new AuthError();
        }

        const user = {
            id: refreshTokenDB.user_id,
        };
        const tokens = await this.responseWithTokens(user, userAgent);
        await refreshTokenModel.updateRefreshToken(refreshTokenDB.id);
        return tokens;
    }

    /* Revoke Token */
    async addRevokedToken(accessToken, tokenPayload) {
        await revokedTokenModel.addRevokeToken(accessToken, tokenPayload.exp);
    }

    /* Verify Email */
    async verifyEmail(token) {
        const payload = jwt.verify(token, authConfig.verificationSecret);

        // Lấy id của user từ payload
        const userId = payload.sub;

        // Kiểm tra user này đã verify email hay chưa?
        const count = await userModel.findByVerifyEmail(userId);
        if (count > 0) throw new EmailVerifyError("Email đã được xác thực");

        // Verify Email
        await userModel.updateVerifyEmail(userId);
    }

    /* Đổi mật khẩu */
    async changePassword(
        user,
        current_password,
        new_password,
        confirm_password,
    ) {
        // Kiểm tra mật khẩu mới và confirm có khớp không?
        if (new_password !== confirm_password)
            throw new PasswordError(
                passwordErrors.confirmPasswordMismatch.name,
            );

        // Mật khẩu mới không được trùng mật khẩu cũ
        if (current_password === new_password)
            throw new PasswordError(passwordErrors.samePassword.name);

        // Kiểm tra mật khẩu cũ có đúng không?
        const isMatch = await this.comparePassword(
            current_password,
            user.password,
        );
        if (!isMatch)
            throw new PasswordError(
                passwordErrors.incorrectCurrentPassword.name,
            );

        // Cập nhật mật khẩu mới!
        const hashedPassword = await this.hashPassword(new_password);
        await userModel.updatePassword(user.id, hashedPassword);

        // Gửi Email thông báo qua queue
        await queueService.push("sendPasswordChangeEmail", {
            id: user.id,
            email: user.email,
            changeTime: new Date().toLocaleString("vi-VN"),
        });
    }
}

module.exports = new AuthService();
