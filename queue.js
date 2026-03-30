require("dotenv").config();
require("module-alias/register");
const { taskStatus } = require("@/configs/constants");
const tasks = require("@/tasks");
const queueService = require("@/services/queue.service");
const sleep = require("@/utils/sleep");

/**
 * Worker: Định kỳ kiểm tra xem có task để làm hay không?
 */
(async () => {
    console.log("Worker đang chạy & lắng nghe hàng đợi...");
    while (true) {
        /* Tìm việc đang pending */
        const firstTask = await queueService.getPendingTask();

        if (firstTask) {
            const { id, type, payload: jsonPayload } = firstTask;

            try {
                /* Chuyển trạng thái sang đang xử lý */
                await queueService.updateStatus(id, taskStatus.inprogress);

                const payload = JSON.parse(jsonPayload);
                const handler = tasks[type];

                /* Xử lý công việc trong hàng đợi */
                if (handler) {
                    await handler(payload); // Phải await (chờ) công việc này xong mới xử lý công việc tiếp theo!

                    /* Chuyển trạng thái sang hoàn thành */
                    await queueService.updateStatus(id, taskStatus.completed);
                    console.log(`Job: ${id}, ${type} thành công!`);
                } else {
                    /* Chuyển sang trạng thái thất bại */
                    await queueService.updateStatus(id, taskStatus.failed);
                    console.log(
                        `Không tìm thấy handler cho loại task: ${type}`,
                    );
                }
            } catch (error) {
                /* Chuyển sang trạng thái thất bại */
                // Thông tin lỗi
                const info = JSON.stringify({
                    message: String(error),
                });

                // Cập nhật thông tin lỗi vào DB
                await queueService.updateStatus(id, taskStatus.failed, info);
                console.log(`Lỗi khi xử lý Job ${id}: `, error.message);
            }
        }

        // Định kỳ 3 giây kiểm tra lượt tiếp theo
        await sleep(3000);
    }
})();
