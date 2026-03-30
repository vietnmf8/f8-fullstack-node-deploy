const { httpCodes } = require("@/configs/constants");

const memoryStore = new Map();

const createRateLimiter = (config) => {
    const { windowMs, maxRequests, message } = config;
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();

        // Xử lý IP mới
        if (!memoryStore.has(ip)) {
            memoryStore.set(ip, { count: 1, lastReset: now });
            return next();
        }

        // Lấy dữ liệu IP cũ
        const data = memoryStore.get(ip);

        // Kiểm tra reset thời gian (Window Reset)
        if (now - data.lastReset > windowMs) {
            data.count = 1;
            data.lastReset = now;
            return next();
        }

        // Kiểm tra vượt giới hạn (Rate Limit Check)
        if (data.count >= maxRequests) {
            return res
                .status(httpCodes.tooManyRequests)
                .json({ error: message });
        }

        // Ghi nhận yêu cầu hợp lệ
        data.count++;
        next();
    };
};

/* Instance mặc định */
const apiRateLimiter = createRateLimiter({
    windowMs: 60000, // 1 phút
    maxRequests: 100,
    message: "Too many requests",
});

module.exports = { createRateLimiter, apiRateLimiter };
