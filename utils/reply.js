const moment = require('moment-timezone');
const db = require('./db');

module.exports = {
    label: [
        '美金 (USD)',
        '港幣 (HKD)',
        '英鎊 (GBP)',
        '澳幣 (AUD)',
        '加拿大幣 (CAD)',
        '新加坡幣 (SGD)',
        '瑞士法郎 (CHF)',
        '日圓 (JPY)',
        '南非幣 (ZAR)',
        '瑞典幣 (SEK)',
        '紐元 (NZD)',
        '泰幣 (THB)',
        '菲國比索 (PHP)',
        '印尼幣 (IDR)',
        '歐元 (EUR)',
        '韓元 (KRW)',
        '越南盾 (VND)',
        '馬來幣 (MYR)',
        '人民幣 (CNY)'
    ],
    translation: {
        'USD': ['USD', '美金', '美元'],
        'HKD': ['HKD', '港幣', '港元'],
        'GBP': ['GBP', '英鎊'],
        'AUD': ['AUD', '澳幣'],
        'CAD': ['CAD', '加拿大幣', '加拿大元', '加幣', '加元'],
        'SGD': ['SGD', '新加坡幣'],
        'CHF': ['CHF', '瑞士法郎', '瑞郎', '法郎'],
        'JPY': ['JPY', '日圓', '日幣'],
        'ZAR': ['ZAR', '南非幣', '南非蘭特'],
        'SEK': ['SEK', '瑞典幣'],
        'NZD': ['NZD', '紐元', '紐幣', '紐西蘭元'],
        'THB': ['THB', '泰幣','泰銖'],
        'PHP': ['PHP', '菲國比索', '菲律賓比索', '菲幣'],
        'IDR': ['IDR', '印尼幣', '印尼盾'],
        'EUR': ['EUR', '歐元'],
        'KRW': ['KRW', '韓元', '韓幣'],
        'VND': ['VND', '越南盾'],
        'MYR': ['MYR', '馬來幣', '馬來西亞幣', '馬幣'],
        'CNY': ['CNY', '人民幣']
    },
    help() {
        let msg =
            '以下為可使用之指令 ➣' + '\n\n' +

            '/HELP → 幫助' + '\n' +
            '/LIST → 可查詢幣別' + '\n' +
            '/NOTIFY 幣別 匯率下限 現金/即期 → 記錄匯率低於定額時自動推播通知'  + '\n' +
            '/NOTIFYLIST → 查看已儲存推播通知'
        ;
        return msg;
    },
    list() {
        let msg =
            '以下為可查詢幣別 ➣' + '\n\n' +

            this.label.join('\n') + '\n\n' +

            '請直接輸入中文或英文幣別查詢' + '\n' +
            '若需查詢日期 請使用 日期 + 幣別' + '\n' +
            'e.g. 2018/01/01 美金'
        ;
        return msg;
    },
    processMessage(event) {
        switch (event.message.type) {
            case 'text':
                let messageAry = event.message.text.toUpperCase().split(' ');
                let message = messageAry[0];
                let replyStr = '';
                let translation = this.translation;
                switch (message) {
                    // 幫助(列出所有指令)
                    case '/HELP':
                        replyStr = this.help();
                        event.reply(replyStr);
                        break;
                    // 所有可查詢幣別
                    case '/LIST':
                        replyStr = this.list();
                        event.reply(replyStr);
                        break;
                    // 儲存推播記錄
                    case '/NOTIFY':
                        let currency = messageAry[1];
                        let standard = messageAry[2];
                        let type     = messageAry[3];

                        if (type !== '現金' && type !== '即期') {
                            replyStr =
                                '種類設定錯誤喔 ~' + '\n' +
                                '僅能 現金/即期 ~'
                            ;
                            event.reply(replyStr);
                            return false;
                        }

                        // 下限輸入錯誤 (不是數字)
                        if (isNaN(parseFloat(standard)) || !isFinite(standard)) {
                            replyStr =
                                '推播下限設定錯誤喔 ~' + '\n' +
                                '僅能輸入數字 ~'
                            ;
                            event.reply(replyStr);
                            return false;
                        }

                        // 儲存推播記錄
                        for (let t in translation) {
                            for (let val of translation[t]) {
                                if (currency === val) {
                                    // 確認是否已存在此筆推播記錄
                                    db.select('notify', {lineId: event.source.userId, currency: t, type: type, notify: false}, {}, data => {
                                        data = data.pop();
                                        if (data === undefined) {
                                            db.insert('notify', {
                                                lineId: event.source.userId,
                                                currency: t,
                                                standard: standard,
                                                type: type,
                                                notify: false,
                                                itime: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                utime: null
                                            });
                                            replyStr =
                                                '已記錄幣別: ' + t + ' (' + type + ') ' + '\n' +
                                                '在此幣別低於 ' + standard + ' 時將自動通知你唷 ~'
                                            ;
                                        } else {
                                            db.update('notify', {_id: data._id}, {standard: standard}, true);
                                            replyStr =
                                                '已更新幣別: ' + t + ' (' + type + ') ' + '\n' +
                                                '在此幣別低於 ' + standard + ' 時將自動通知你唷 ~'
                                            ;
                                        }
                                        event.reply(replyStr);
                                    }, {}, 1);
                                    return false;
                                    break;
                                }
                            }
                        }

                        // 幣別輸入錯誤
                        replyStr =
                            '幣別設定錯誤喔 ~' + '\n' +
                            '輸入 /LIST 查詢所有幣別'
                        ;
                        event.reply(replyStr);
                        break;
                    // 推播記錄
                    case '/NOTIFYLIST':
                        db.select('notify', {lineId: event.source.userId, notify: false}, {}, data => {
                            data = data.pop();
                            if (data === undefined) {
                                replyStr =
                                    '目前還沒有儲存任何需推播的通知喔 ~'
                                ;
                                event.reply(replyStr);
                            } else {
                                data.forEach(val => {
                                    replyStr =
                                        '幣別: ' + val.currency + '\n' +
                                        '通知匯率: ' + val.standard
                                    ;
                                    event.reply(replyStr);
                                });
                            }
                        });
                        break;
                    default:
                        // 日期+幣別
                        if (messageAry.length > 1) {
                            let date = moment(new Date(message)).format('YYYY-MM-DD');
                            if (date === 'Invalid date') {
                                replyStr =
                                    '日期格式錯誤 ~ 請依照此格式輸入 ↓' + '\n' +
                                    'e.g. 2018/01/01 美金'
                                ;
                                event.reply(replyStr);
                                return false;
                            } else {
                                // 未來時間
                                if (new Date(message) - new Date() > 0) {
                                    replyStr =
                                        '無法查詢未來的資料唷 ~';
                                    ;
                                    event.reply(replyStr);
                                    return false;
                                }
                                for (let t in translation) {
                                    for (let val of translation[t]) {
                                        if (messageAry[1] === val) {
                                            // 搜尋指定日期資料
                                            let pattern = new RegExp('^' + date);
                                            db.select('rate', {time: pattern}, {time: 1, rate: {$elemMatch: {currency: t}}}, data => {
                                                data = data.pop();
                                                if (data === undefined) {
                                                    replyStr =
                                                        '查無此日期的資料，僅能查詢到2018/01/11後的資料唷 ~'
                                                    ;
                                                } else {
                                                    replyStr =
                                                        '排掛時間: ' + data.time + '\n' +
                                                        '現金匯率: ' + data.rate[0].cashSellinging + '\n' +
                                                        '即期匯率: ' + data.rate[0].spotSellinging
                                                    ;
                                                }
                                                event.reply(replyStr);
                                            }, {time: -1}, 1);
                                            return false;
                                        }
                                    }
                                }
                            }
                        }

                        // 搜尋內建回應字串
                        for (let t in translation) {
                            for (let val of translation[t]) {
                                if (message === val) {
                                    db.select('rate', {}, {time: 1, rate: {$elemMatch: {currency: t}}}, data => {
                                        data = data.pop();
                                        replyStr =
                                            '排掛時間: ' + data.time + '\n' +
                                            '現金匯率: ' + data.rate[0].cashSellinging + '\n' +
                                            '即期匯率: ' + data.rate[0].spotSellinging
                                        ;
                                        event.reply(replyStr);
                                    }, {time: -1}, 1);
                                    return false;
                                }
                            }
                        }

                        // 輸入的文字不在內建translation裡
                        replyStr =
                            '看不懂你說的內' + '\n' +
                            '輸入 /HELP 查看所有指令'
                        ;
                        event.reply(replyStr);
                        break;
                }
                break;
            case 'image':
                // event.message.content().then(data => {
                //  const s = data.toString('base64').substring(0, 30);
                //  return event.reply('Nice picture! ' + s);
                // }).catch(error => {
                //  return event.reply(error.toString());
                // });
                break;
            case 'video':
                // event.reply('Nice movie!');
                break;
            case 'audio':
                // event.reply('Nice song!');
                break;
            case 'location':
                // event.reply(['That\'s a good location!', 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
                break;
            case 'sticker':
                event.reply({
                    type: 'sticker',
                    packageId: 2,
                    stickerId: 149
                });
                break;
            default:
                event.reply('Unknow message: ' + JSON.stringify(event));
                break;
        }
    }
}
