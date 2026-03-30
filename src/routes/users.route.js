const express = require("express");
const router = express.Router();
const userController = require("@/controllers/user.controller");
const authRequired = require("@/middlewares/authRequired");

router.get("/", userController.getAll);
router.get("/search", authRequired, userController.search); // đặt đằng trước params :id
router.get("/:id/posts", userController.getUserPosts);
router.get("/:id", userController.getOne);
router.post("/", userController.create);

module.exports = router;
