const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../config.json');
const system = require('./logsystem.js');
const db = require('./db.js');
const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<WithId<Document>[]>}
 */
exports.find = async function (dbName, collectionName, filter) {
    const collection = await dbClient.db(dbName).collection(collectionName);

    return await collection.find(filter).toArray();
}

/***
 * filterに該当する要素があるかどうか確認する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<boolean>}
 */
exports.includes = async function (dbName, collectionName, filter) {
    const collection = await dbClient.db(dbName).collection(collectionName);
    const data = await collection.find(filter).toArray();
    return data.length > 0;
}

/***
 * データベースを更新する
 * @param dbName 更新先データベース名
 * @param collectionName 更新先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param update update operatorを用いた更新内容の記述
 * @returns {Promise<void>}
 */
exports.update = async function run(dbName, collectionName, filter, update) {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.updateOne(filter,update);
        await system.log(`${dbName}.${collectionName}を更新`,`DB更新実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}を更新できませんでした`,err,`DB更新失敗`);
    }
}


/***
 * データベースにレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
exports.insert = async function run(dbName, collectionName, object) {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.insertOne(object);
        await system.log(`${dbName}.${collectionName}にレコード追加`,`DB追加実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`,err,`DB追加失敗`);
    }
}

/***
 * filterにレコードが見つかればそれをsetで更新し、見つからなけれレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
exports.updateOrInsert = async function run(dbName, collectionName,filter, object) {
    try {
        const data = await db.find(dbName,collectionName,filter);
        if(data.length > 0){
            await db.update(dbName, collectionName, filter,{$set: object});
        }
        else{
            await db.insert(dbName, collectionName, object);
        }
    } catch(err) {
        await system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`,err,`DB追加失敗`);
    }
}

/***
 * データベースからレコードを削除する
 * @param dbName 削除元データベース名
 * @param collectionName 削除元コレクション名
 * @param filter 削除対象のフィルターを指定
 * @returns {Promise<void>}
 */
exports.delete = async function run(dbName,collectionName,filter) {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.deleteMany(filter);
        await system.log(`${dbName}.${collectionName}からレコード削除(削除されたとは言っていない)`,`DBレコード削除操作実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}からレコードを削除できませんでした`,err,`DB削除失敗`);
    }
}

/***
 *
 * @returns {Promise<void>}
 */
exports.open = async function close(){
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    await system.log("DB - open");
}

/***
 *
 * @returns {Promise<void>}
 */
exports.close = async function close(){
    await dbClient.close();
    await system.log("DB - close");
}

//引数の詳細については、mongodbの公式ドキュメントを参照すること