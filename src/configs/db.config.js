const dbConfig = {
    /* DB */
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT || 3306,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    /* Backup */
    backupLocalDir: process.env.DB_BACKUP_LOCAL_DIR,
    backupRemoteName: process.env.DB_BACKUP_REMOTE_NAME,
    backupRemoteDir: process.env.DB_BACKUP_REMOTE_DIR,
};

module.exports = dbConfig;
