const express = require("express");
const fs = require("node:fs");
const router = express.Router();

const basePath = "./src/routes";
const postFix = ".route.js"; // Hậu tố

fs.readdirSync(basePath)
    .filter((_fileName) => _fileName.endsWith(postFix)) // tasks.route.js
    .forEach((fileName) => {
        const resource = fileName.replace(postFix, ""); // tasks
        router.use(`/${resource}`, require(`./${fileName}`));
    });

// const tasksRouter = require("./tasks.route");
// const postsRouter = require("./posts.route");

// router.use("/tasks", tasksRouter);
// router.use("/posts", postsRouter);

module.exports = router;
