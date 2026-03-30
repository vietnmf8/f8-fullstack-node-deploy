const express = require("express");
const router = express.Router();
const taskController = require("@/controllers/task.controller");
const authRequired = require("@/middlewares/authRequired");

/* [GET] /api/tasks */
router.get("/", taskController.getAll);

/* [GET] /api/tasks/1 */
router.get("/:id", taskController.getOne);

/* [POST] /api/tasks */
router.post("/", authRequired, taskController.create);

/* [DELETE] /api/tasks/123 */
router.delete("/", authRequired, taskController.destroy);

module.exports = router;
