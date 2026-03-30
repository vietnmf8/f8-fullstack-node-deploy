const ttlFormat = (value) => {
    const DEFAULT_TTL = 3600; // Mặc định 1 giờ (tính bằng giây)
    const rawValue = value?.trim();

    // Trường hợp không có giá trị hoặc chỉ có khoảng trắng
    if (!rawValue) {
        return DEFAULT_TTL;
    }

    // Kiểm tra nếu là SỐ THUẦN TÚY (Ví dụ: "3600", "7200")
    if (/^\d+$/.test(rawValue)) {
        return Number(rawValue);
    }

    // Kiểm tra nếu là CHUỖI ĐỊNH DẠNG (Ví dụ: "1h", "2d", "30m")
    const isValidTimeFormat = /^\d+[smhd]$/i.test(rawValue);
    if (isValidTimeFormat) {
        return rawValue;
    }

    // Nếu nhập bừa (Ví dụ: "abc", " "), trả về mặc định để tránh lỗi hệ thống
    return DEFAULT_TTL;
};

module.exports = ttlFormat;
