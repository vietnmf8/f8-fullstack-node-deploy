const fs = require("node:fs");

const basePath = "./src/transformers";
const postFix = ".transformer.js"; // Hậu tố

const transformers = {};

fs.readdirSync(basePath)
    .filter((_fileName) => _fileName.endsWith(postFix)) // post.transformer.js
    .forEach((fileName) => {
        const resource = fileName.replace(postFix, ""); // post
        transformers[resource] = require(`./${fileName}`);
    });

module.exports = transformers;
