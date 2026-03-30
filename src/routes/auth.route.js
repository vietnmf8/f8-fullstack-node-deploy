const express = require("express");
const router = express.Router();
const authController = require("@/controllers/auth.controller");
const authRequired = require("@/middlewares/authRequired");

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authRequired, authController.logout);
router.post("/change-password", authRequired, authController.changePassword);
router.get("/me", authRequired, authController.getCurrentUser);

module.exports = router;
