const ttlFormat = require("@/utils/ttlFormat");

const authConfig = {
    secret: process.env.AUTH_JWT_SECRET,
    verificationSecret: process.env.AUTH_JWT_VERIFICATION_SECRET,
    accessTokenTTL: ttlFormat(process.env.AUTH_JWT_ACCESS_TOKEN_TTL),
    verificationTokenTTL: ttlFormat(process.env.AUTH_JWT_VERIFICATION_TTL),
    refreshTokenTTL: +process.env.AUTH_REFRESH_TOKEN_TTL || 7,
    saltRounds: +process.env.AUTH_SALT_ROUNDS || 10,
};

module.exports = authConfig;
