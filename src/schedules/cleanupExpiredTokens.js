const revokedTokenModel = require("@/models/revokedToken.model");

async function cleanupExpiredTokens() {
    const result = await revokedTokenModel.deleteRevokeToken();
    console.log(`Đã xoá ${result} token hết hạn!`);
}

module.exports = cleanupExpiredTokens;
