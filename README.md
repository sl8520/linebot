# linebot
> 背景每天去爬取台銀的匯率, 再利用linebot做各種查詢或通知匯率。

## 項目
* 前台: line
* 後台: nodejs + mongodb

## Build Setup

``` bash
# install dependencies
npm install

# start mongodb
net start MongoDB

# start spider
pm2 start main.js

# start linebot
pm2 start linebot.js
```
