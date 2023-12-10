const cron = require('node-cron');
const billModel = require('../models/bill.model');

cron.schedule('0 0 */3 * *', async () => {
    try {
        // Xóa các bill documents đã bị xóa (bill_status = 'deleted') mỗi 3 ngày
        await billModel.deleteMany({ bill_status: 'deleted' });
        console.log('Cron job: Deleted expired bill documents.');
    } catch (error) {
        console.error('Cron job: Error deleting expired bill documents:', error);
    }
});