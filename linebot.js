require('dotenv').config();
const linebot = require('linebot');
const reply = require('./utils/reply');

const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

bot.on('message', event => {
    reply.processMessage(event);
});

bot.on('follow', event => {
    db.insert('line', {lineId: event.source.userId});
    // event.reply('follow: ' + event.source.userId);
});

bot.on('unfollow', event => {
    db.delete('line', {lineId: event.source.userId});
    // event.reply('unfollow: ' + event.source.userId);
});

// bot.on('join', event => {
//  event.reply('join: ' + event.source.groupId);
// });

// bot.on('leave', event => {
//  event.reply('leave: ' + event.source.groupId);
// });

bot.on('postback', event => {
    console.log(event.postback.data)
    // event.reply('postback: ' + event.postback.data);
});

// bot.on('beacon', event => {
//  event.reply('beacon: ' + event.beacon.hwid);
// });

bot.listen('/linewebhook', process.env.PORT || 3000, () => {
    console.log('LineBot is running.');
});
