const { httpCodes } = require("@/configs/constants");

const response = (_, res, next) => {
    // Nếu thành công!
    res.success = (data, status = httpCodes.success, passProps = {}) => {
        res.status(status).json({
            status: "success",
            data,
            ...passProps,
        });
    };

    // Phân trang
    res.paginate = ({ rows, pagination }) => {
        res.success(rows, httpCodes.success, {
            pagination,
        });
    };

    // Nếu lỗi
    res.error = (error, status = httpCodes.serverError) => {
        res.status(status).json({
            status: "error",
            error,
        });
    };

    next();
};

module.exports = response;
