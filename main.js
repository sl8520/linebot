const schedule = require('node-schedule');
const db = require('./utils/db');
const spider = require('./utils/spider');

require('./node_color');

// 抓取匯率 - 每五分鐘跑一次
schedule.scheduleJob('*/5 * * * *', () => {
    spider.post();
});
