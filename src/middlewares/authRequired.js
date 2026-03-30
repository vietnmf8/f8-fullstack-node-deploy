const userModel = require("@/models/user.model");
const { httpCodes } = require("@/configs/constants");
const authService = require("@/services/auth.service");
const getClientToken = require("@/utils/getClientToken");
const revokedTokenModel = require("@/models/revokedToken.model");

const authRequired = async (req, res, next) => {
    // Kiểm tra accessToken
    const accessToken = getClientToken(req.headers);
    if (!accessToken) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    // Verify Token
    const tokenPayload = await authService.verifyAccessToken(accessToken);

    // Kiểm tra Blacklist
    const countRevokedToken =
        await revokedTokenModel.countRevokedToken(accessToken);
    if (countRevokedToken > 0)
        return res.error("Unauthorized", httpCodes.unauthorized);

    // Kiểm tra user
    const user = await userModel.findOne(tokenPayload.sub);
    if (!user) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    // Gán vào req để cho res trả về cho client
    req.auth = {
        user,
        accessToken,
        tokenPayload,
    };
    next();
};

module.exports = authRequired;
