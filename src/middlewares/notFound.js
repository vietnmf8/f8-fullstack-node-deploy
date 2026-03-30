const { httpCodes } = require("@/configs/constants");

const notFound = (req, res) => {
    res.error(
        {
            message: `Cannot ${req.method} ${req.url}`,
        },
        httpCodes.notFound,
    );
};

module.exports = notFound;
