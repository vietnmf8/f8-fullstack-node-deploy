const { httpCodes } = require("@/configs/constants");

/* Base Error */
class AppError {
    constructor(message, statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
}

class EmailExistError extends AppError {
    constructor(message = "Email already exists") {
        super(message, httpCodes.badRequest);
    }
}

/* EMAIL */
class EmailVerifyError extends AppError {
    constructor(message = "Verify Email") {
        super(message, httpCodes.forbidden);
    }
}

class ValidateError extends AppError {
    constructor(message = "Invalid email or password") {
        super(message, httpCodes.unauthorized);
    }
}

class ConversationTypeError extends AppError {
    constructor(message = "Invalid conversation type") {
        super(message, httpCodes.badRequest);
    }
}

class TargetUserExistConversation extends AppError {
    constructor(message = "User already in conversation") {
        super(message, httpCodes.conflict);
    }
}

class UserPermission extends AppError {
    constructor(message = "No permission") {
        super(message, httpCodes.forbidden);
    }
}

/*  AUTH */
class AuthError extends AppError {
    constructor(message = "Authentication failed") {
        super(message, httpCodes.unauthorized);
    }
}

class NoContent extends AppError {
    constructor(message = "Content cannot be empty") {
        super(message, httpCodes.badRequest);
    }
}

/* Change Password */
class PasswordError extends AppError {
    constructor(name, message = "Unprocessable Entity") {
        super(message, httpCodes.unprocessableEntity);
        this.name = name;
    }
}

module.exports = {
    EmailExistError,
    AuthError,
    ValidateError,
    ConversationTypeError,
    TargetUserExistConversation,
    UserPermission,
    NoContent,
    PasswordError,
    EmailVerifyError,
};
