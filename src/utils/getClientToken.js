/* Lấy Access Token từ Client gửi lên */
function getClientToken(headers) {
    const authHeader = headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const accessToken = authHeader.split(" ")[1]?.trim();
    return accessToken || null;
}
module.exports = getClientToken;
