const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// MongoDB 连接字符串
const uri = process.env.MONGODB_URI;

// 创建 MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// 从环境变量中获取远程用户名
// const remoteUser = process.env.REMOTE_USER || 'bigcat'; // 默认值为 bigcat
const remoteUser = 'bigcat'; // 默认值为 bigcat

async function exportRemoteUserNotes() {
    try {
        // 连接到 MongoDB
        await client.connect();
        
        // 获取数据库和集合
        const db = client.db("sweetnotes");
        const notesCollection = db.collection("notes");

        // 查询远程用户的便签
        const remoteNotes = await notesCollection.find({
            username: remoteUser
        }).toArray();

        console.log(`获取到 ${remoteUser} 的便签:`, remoteNotes);
        return remoteNotes;

    } catch (err) {
        console.error("获取远程便签出错:", err);
        return [];
    } finally {
        // 确保关闭数据库连接
        await client.close();
    }
}

// 导出函数
module.exports = exportRemoteUserNotes;
if (require.main === module) {
    exportRemoteUserNotes().catch(console.dir);
}