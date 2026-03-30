require("dotenv").config();
require("module-alias/register");

/* Khai báo */
const express = require("express");
const cors = require("cors");
const apiRouter = require("@/routes");

/* Middleware */
const responseMiddleware = require("@/middlewares/response");
const errorHandlerMiddleware = require("@/middlewares/errorHandler");
const notFoundMiddleware = require("@/middlewares/notFound");
const { apiRateLimiter } = require("@/middlewares/rateLimiter");

// Chỉ cần require vào thôi
require("@/configs/database.config");

const app = express();
const port = 3000;

/* Sử dụng thực tế */
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(apiRateLimiter);
app.use(responseMiddleware);

/* [GET] / */
app.get("/", (req, res) => {
    throw new Error("BROKEN");
});

app.use("/api", apiRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

/* Listen */
app.listen(port, () => {
    console.log(`Đang lắng nghe tại cổng: ${port}`);
});
