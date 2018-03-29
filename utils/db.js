/**
 *
 *  default database: exchangeRate
 *  @author 彥彬 <sl8520108@gmail.com>
 *
 *  使用方法
 *
 *  新增: insert
 *  @param  {string}    collection  表名稱
 *  @param  {array} ||
 *          {object}    data        新增的陣列或物件
 *  @param  {function}  callback    回調函數
 *
 *  e.g. db.insert('rate', [{'test': 'test1'}, {'test': 'test1'}, {'test': 'test1'}, {'test': 'test2'}]);
 *
 *  刪除:
 *  @param  {string}    collection  表名稱
 *  @param  {object}    query       刪除條件
 *  @param  {boolean}   limitOne    是否僅刪除一筆
 *  @param  {function}  callback    回調函數
 *
 *  e.g. db.delete('rate', {});
 *
 *  更新:
 *  @param  {string}    collection  表名稱
 *  @param  {object}    query       更新條件
 *  @param  {object}    data        更新資料
 *  @param  {boolean}   limitOne    是否僅更新一筆
 *  @param  {function}  callback    回調函數
 *
 *  e.g. db.update('rate', {test: 'test1'}, {test: 'test3'}, true);
 *
 *  查詢:
 *  @param  {string}    collection  表名稱
 *  @param  {object}    query       查詢條件
 *  @param  {object}    projection  出現欄位
 *  @param  {function}  callback    回調函數
 *  @param  {object}    sort        排序
 *  @param  {integer}   limit       查詢數目
 *
 *  e.g.
 *  db.select('rate', {}, {}, data => {
 *      console.warn(JSON.stringify(data));
 *  });
 *
 */


const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('../config/db');

let dbFun = function(){
    let fn = {
        currentDb: null,
        switch(database) {
            this.currentDb = database;
        },
        select(table, query = {}, projection = {}, callback, sort = {}, limit = 0) {
            MongoClient.connect(dbConfig.url, (err, database) => {
                if (err) throw err;
                // 連接database
                const db = database.db(this.currentDb);
                // 搜尋資料
                db.collection(table).find(query).project(projection).sort(sort).limit(limit).toArray((err, result) => {
                    if (err) throw err;
                    if (callback && typeof callback === 'function') {
                        return callback(result);
                    }
                });
                // 關閉連線
                database.close();
            });
        },
        insert(table, data, callback) {
            MongoClient.connect(dbConfig.url, (err, database) => {
                if (err) throw err;
                // 連接database
                const db = database.db(this.currentDb);
                // 新增資料
                if (Array.isArray(data)) {
                    // 陣列使用多筆方法
                    db.collection(table).insertMany(data, (err, result) => {
                        if (err) throw err;
                    });
                } else {
                    // 物件使用單筆方法
                    db.collection(table).insertOne(data, (err, result) => {
                        if (err) throw err;
                    });
                }
                // callback function
                if (callback && typeof callback === 'function') {
                    callback();
                }
                // 關閉連線
                database.close();
            });
        },
        update(table, query = {}, data, limitOne = false, callback) {
            MongoClient.connect(dbConfig.url, (err, database) => {
                if (err) throw err;
                // 連接database
                const db = database.db(this.currentDb);
                // 更新資料
                if (!limitOne) {
                    // 更新多筆 (預設)
                    db.collection(table).updateMany(query, {$set: data}, (err, result) => {
                        if (err) throw err;
                    });
                } else {
                    // 僅更新一筆
                    db.collection(table).updateOne(query, {$set: data}, (err, result) => {
                        if (err) throw err;
                    });
                }
                // callback function
                if (callback && typeof callback === 'function') {
                    callback();
                }
                // 關閉連線
                database.close();
            });
        },
        delete(table, query = {}, limitOne = false, callback) {
            MongoClient.connect(dbConfig.url, (err, database) => {
                if (err) throw err;
                // 連接database
                const db = database.db(this.currentDb);
                // 刪除資料
                if (!limitOne) {
                    // 刪除多筆 (預設)
                    db.collection(table).deleteMany(query, (err, result) => {
                        if (err) throw err;
                    });
                } else {
                    // 僅刪除一筆
                    db.collection(table).deleteOne(query, (err, result) => {
                        if (err) throw err;
                    });
                }
                // callback function
                if (callback && typeof callback === 'function') {
                    callback();
                }
                // 關閉連線
                database.close();
            });
        },
        init(database = 'exchangeRate') {
            this.currentDb = database;
        }
    };
    fn.init();
    return fn;
}

module.exports = new dbFun();
