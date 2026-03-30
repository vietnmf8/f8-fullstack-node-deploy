const Pusher = require("pusher");
require("dotenv").config();
const soketiConfig = require("@/configs/soketi.config");

const pusher = new Pusher({
    appId: soketiConfig.appId,
    key: soketiConfig.key,
    secret: soketiConfig.secret,
    cluster: soketiConfig.cluster,
    useTLS: false,
    host: "127.0.0.1",
    port: "6002",
});

module.exports = pusher;
