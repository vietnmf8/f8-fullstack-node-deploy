const constants = {
    httpCodes: {
        success: 200,
        created: 201,
        badRequest: 201,
        unauthorized: 401,
        forbidden: 403,
        conflict: 409,
        notFound: 404,
        tooManyRequests: 429,
        serverError: 500,
        unprocessableEntity: 422, // format đúng, nhưng dữ liệu sai logic
    },
    errorCodes: {
        conflict: "ER_DUP_ENTRY",
    },

    prismaCodes: {
        notFound: "P2025",
    },

    passwordErrors: {
        confirmPasswordMismatch: {
            name: "Password confirmation mismatch",
            message: "Mật khẩu xác nhận không khớp",
        },

        incorrectCurrentPassword: {
            name: "IncorrectCurrentPassword",
            message: "Mật khẩu hiện tại không đúng",
        },

        samePassword: {
            name: "SamePassword",
            message: "Mật khẩu mới phải khác mật khẩu hiện tại",
        },

        invalidNewPassword: {
            name: "InvalidNewPassword",
            message: "Mật khẩu mới không hợp lệ",
        },
    },

    taskStatus: {
        pending: "pending",
        inprogress: "inprogress",
        completed: "completed",
        failed: "failed",
    },

    chatRole: {
        user: "user",
        assistant: "assistant",
        system: "system",
    },
};

module.exports = constants;
