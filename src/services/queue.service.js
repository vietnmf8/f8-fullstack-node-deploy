const queueModel = require("@/models/queue.model");

class QueueService {
    /* Đẩy việc vào hàng đợi */
    async push(type, payload) {
        const result = await queueModel.push(type, payload);
        return result;
    }

    /* Lấy ra việc xếp đầu tiên trong queue */
    async getPendingTask() {
        const firstTask = await queueModel.getPendingTask();
        return firstTask ?? null;
    }

    /* Cập nhật trạng thái của job */
    async updateStatus(id, status, info) {
        const result = await queueModel.updateStatus(id, status, info);
        return result;
    }
}

module.exports = new QueueService();
