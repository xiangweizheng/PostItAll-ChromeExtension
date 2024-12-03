require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// 从环境变量中获取连接字符串
const uri = process.env.MONGODB_URI;

// 创建 MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // 连接到服务器
    await client.connect();
    // 发送 ping 确认连接成功
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // 创建数据库和集合
    const db = client.db("stickyNotes"); // 创建或选择数据库
    const notesCollection = db.collection("notes"); // 创建或选择集合

    // 读取所有便签
    const notes = await notesCollection.find({}).toArray(); // 查询所有便签
    console.log("Retrieved notes:", notes);
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    // 确保在完成/错误时关闭客户端
    await client.close();
  }
}

run().catch(console.dir);