const dbConfig = require("@/configs/db.config");
const mailConfig = require("@/configs/mail.config");
const mailService = require("@/services/mail.service");
const { getDateStringYmdHis } = require("@/utils/dateFormat");
const { execSync } = require("node:child_process");

async function backupDB() {
    const { host, user, password, port, database } = dbConfig;
    const dateStr = getDateStringYmdHis();
    const { backupLocalDir, backupRemoteDir, backupRemoteName } = dbConfig;

    const backupCmd = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${backupLocalDir}/${database}_${dateStr}.sql`;

    try {
        /* Backup Database về Server */
        execSync(backupCmd);
        console.log("Backup Success!");

        /* Rclone: Copy file Backup lên Google Drive */
        // rclone copy <thư_mục_nguồn> <tên_remote>:<thư_mục_đích>
        const fileName = `${database}_${dateStr}.sql`;
        const copyCmd = `rclone copy ${backupLocalDir}/${fileName} ${backupRemoteName}:${backupRemoteDir}`;
        execSync(copyCmd);
        console.log("Upload to Google Drive Successfully!");

        /* Gửi email */
        await mailService.sendBackupRepost(
            mailConfig.fromAddress,
            fileName,
            dateStr,
        );
        console.log("Send Email Successfully!");
    } catch (error) {
        console.log(error);
    }
}

module.exports = backupDB;
