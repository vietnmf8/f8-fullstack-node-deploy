const { httpCodes } = require("@/configs/constants");
const authService = require("@/services/auth.service");

/* Đăng ký */
const register = async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"];
    const { newUser, tokens } = await authService.register(
        email,
        password,
        userAgent,
    );
    res.success(newUser, httpCodes.created, tokens);
};

/* Verify Email */
const verifyEmail = async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.success("Verified", httpCodes.success);
};

/* Đăng nhập */
const login = async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"];
    const { user, tokens } = await authService.login(
        email,
        password,
        userAgent,
    );
    res.success(user, httpCodes.success, tokens);
};

/* Lấy ra người dùng hiện tại */
const getCurrentUser = async (req, res) => {
    const user = { ...req.auth.user };
    delete user.password;
    res.success(user);
};

/* Lấy ra refresh_token từ phía Client */
const refreshToken = async (req, res) => {
    const refreshToken = req.body.refresh_token;
    const userAgent = req.headers["user-agent"];
    const tokens = await authService.refresh(refreshToken, userAgent);
    res.success(tokens);
};

/* Đăng xuất */
const logout = async (req, res) => {
    const { accessToken, tokenPayload } = req.auth;
    await authService.addRevokedToken(accessToken, tokenPayload);
    res.success(null, 204);
};

/* Change Password */
const changePassword = async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    await authService.changePassword(
        req.auth.user,
        current_password,
        new_password,
        confirm_password,
    );
    res.success("Đổi mật khẩu thành công!");
};

module.exports = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
    verifyEmail,
    changePassword,
};
