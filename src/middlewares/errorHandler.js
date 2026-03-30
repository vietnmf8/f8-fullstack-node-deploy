const {
    errorCodes,
    httpCodes,
    passwordErrors,
    prismaCodes,
} = require("@/configs/constants");
const {
    EmailExistError,
    AuthError,
    ValidateError,
    ConversationTypeError,
    TargetUserExistConversation,
    UserPermission,
    NoContent,
    PasswordError,
    EmailVerifyError,
} = require("@/utils/errors");
const isProduction = require("@/utils/isProduction");
const { JsonWebTokenError } = require("jsonwebtoken");
const errorHandler = (err, _, res, next) => {
    if (res.headerSent) return next(err);

    let status;
    // JWT error
    if (err instanceof JsonWebTokenError) {
        status = httpCodes.unauthorized;

        if (err.name === "TokenExpiredError") {
            err = "Token expired";
        } else if (err.name === "JsonWebTokenError") {
            err = "Invalid token";
        } else {
            err = "Unauthorized";
        }
    }

    // Hứng lỗi xác thực chung
    if (err instanceof AuthError) {
        err = err.message || "Unauthorized";
        status = err.statusCode || httpCodes.unauthorized;
    }

    // Hứng lỗi Email đã tồn tại
    if (err instanceof EmailExistError) {
        err = err.message || "Bad Request";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi Verify Email
    if (err instanceof EmailVerifyError) {
        err = err.message || "Forbidden";
        status = err.statusCode || httpCodes.forbidden;
    }

    // Hứng lỗi Validate
    if (err instanceof ValidateError) {
        err = err.message || "Invalid email or password";
        status = err.statusCode || httpCodes.unauthorized;
    }

    // Hứng lỗi Type sai
    if (err instanceof ConversationTypeError) {
        err = err.message || "Invalid conversation type";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi Đã có Target User trong Conversation
    if (err instanceof TargetUserExistConversation) {
        err = err.message || "User already in conversation";
        status = err.statusCode || httpCodes.conflict;
    }

    // Hứng lỗi User không có quyền thêm user vào conversation
    if (err instanceof UserPermission) {
        err = err.message || "No permission";
        status = err.statusCode || httpCodes.forbidden;
    }

    // Hứng lỗi User không có quyền thêm user vào conversation
    if (err instanceof NoContent) {
        err = err.message || "Content cannot be empty";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi Conflict
    if (err?.code === errorCodes.conflict) {
        err = "Conflict";
        status = httpCodes.conflict;
    }

    // Bổ sung lỗi Prisma
    if (err?.code === prismaCodes.notFound) {
        err = "Not Found";
        status = httpCodes.notFound;
    }

    // Hứng lỗi mật khẩu
    if (err instanceof PasswordError) {
        const config = Object.values(passwordErrors).find(
            (e) => e.name === err.name,
        );

        status = httpCodes.unprocessableEntity;
        err = config?.message || err.message || "Unprocessable Entity";
    }

    // Exception: Lỗi không xác định
    res.error(
        {
            err: !isProduction() ? err : "Server error.",
            message: !isProduction() ? String(err) : "Server error.",
        },
        status,
    );
};

module.exports = errorHandler;
