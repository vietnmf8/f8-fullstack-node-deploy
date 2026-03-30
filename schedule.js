require("dotenv").config();
require("module-alias/register");
const backupDB = require("@/schedules/backupDB");
const cleanupExpiredTokens = require("@/schedules/cleanupExpiredTokens");
const { CronJob } = require("cron");

/* Mỗi lần chạy CronJob là một tiếng trình mới độc lập, không phải chờ lẫn nhau */

/**
 * Cứ 3h sáng
 * Tự động Backup Database
 */
new CronJob("0 3 * * *", backupDB).start();

/**
 * 1h sáng mỗi ngày
 * Tự động Clear những token đã nằm trong Blacklist
 */

new CronJob("0 1 * * *", cleanupExpiredTokens).start();
