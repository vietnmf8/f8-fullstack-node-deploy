const express = require("express");
const router = express.Router();
const authRequired = require("@/middlewares/authRequired");
const conversationController = require("@/controllers/conversation.controller");

//todo: Tất cả các routes về hội thoại đều cần đăng nhập
router.use(authRequired);

/* Tạo mới cuộc hội thoại */
router.post("/", conversationController.create);

/* Lấy danh sách hội thoại của tôi */
router.get("/", conversationController.getAll);

/* Thêm người vào nhóm */
router.post("/:id/participants", conversationController.addParticipant);

/* Gửi tin nhắn */
router.post("/:id/messages", conversationController.sendMessage);

/* Xem lịch sử chat */
router.get("/:id/messages", conversationController.getMessages);

module.exports = router;
