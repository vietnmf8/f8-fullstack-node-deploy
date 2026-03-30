const express = require("express");
const router = express.Router();
const authRequired = require("@/middlewares/authRequired");
const chatBotMessageController = require("@/controllers/chatBotMessage.controller");

//todo: Tất cả các routes về hội thoại đều cần đăng nhập
router.use(authRequired);

/* Lấy lịch sử chat */
router.get("/", chatBotMessageController.getMessages);

/* Chat với AI */
router.post("/chat", chatBotMessageController.chat);

module.exports = router;
