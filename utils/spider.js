const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
const db = require('./db');

require('dotenv').config();
const linebot = require('linebot');
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

module.exports = {
    post() {
        console.warn(moment().format('YYYY-MM-DD HH:mm:ss') + ': 爬蟲GOGO');
        request.post({
            url: 'http://rate.bot.com.tw/xrt?Lang=zh-TW',
            encoding: 'utf8',
            timeout: 1000 * 20
        }, (err, resp, body) => {
            if (!err && resp.statusCode === 200) {
                console.warn(moment().format('YYYY-MM-DD HH:mm:ss') + ': 抓取資料成功');
                const $ = cheerio.load(body);

                // 抓取時間
                let time = $('.time')[0].children[0].data;
                // 抓取表格資料
                let tbody = $('.table.table-striped.table-bordered.table-condensed.table-hover tbody');
                let rate = [];
                for (let i in tbody[0].children) {
                    let tr = tbody[0].children[i];
                    if (tr.type === 'tag' && tr.name === 'tr') {
                        let data = {};
                        for (let j in tr.children) {
                            let td = tr.children[j];
                            if (td.type === 'tag' && td.name === 'td') {
                                switch (td.attribs['data-table']) {
                                    case '幣別':
                                        data.currency = td.children[1].children[5].children[0].data.trim().match(/[A-Z]{3,}/)[0];
                                        break;
                                    case '本行現金買入':
                                        data.cashBuying = td.children[0].data;
                                        break;
                                    case '本行現金賣出':
                                        data.cashSellinging = td.children[0].data;
                                        break;
                                    case '本行即期買入':
                                        data.spotBuying = td.children[0].data;
                                        break;
                                    case '本行即期賣出':
                                        data.spotSellinging = td.children[0].data;
                                        break;
                                    case '遠期匯率買入/賣出':
                                    case '歷史匯率':
                                        continue;
                                        break;
                                }
                            }
                        }
                        rate.push(data);
                    }
                }
                // 存進資料庫的資料
                let insertData = {
                    time: moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss'),
                    rate: rate
                };

                // 搜尋有無重複記錄
                db.select('rate', {time: moment(new Date(time)).format('YYYY-MM-DD HH:mm:ss')}, {}, data => {
                    if (data.length === 0) {
                        // 新增資料
                        db.insert('rate', insertData);
                    }
                });

                // 推播通知
                db.select('notify', {notify: false}, {}, data => {
                    data.forEach(val => {
                        rate.forEach(r => {
                            if (val.currency === r.currency) {
                                let type = val.type === '現金' ? 'cashSellinging' : 'spotSellinging';
                                // 當前匯率低於標準 => 發送推播通知
                                if (r[type] <= val.standard) {
                                    let message =
                                        '幣值: ' + val.currency + '\n' +
                                        '當前匯率: ' + r[type] + '\n' +
                                        '快買快買哦 ~'
                                    ;
                                    bot.push(val.lineId, message);
                                    db.update('notify', {_id: val._id}, {notify: true, utime: moment().format('YYYY-MM-DD HH:mm:ss')}, true);
                                }
                            }
                        });
                    });
                });
            }
        });
    }
}
