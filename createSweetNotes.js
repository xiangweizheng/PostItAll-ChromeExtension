// const fs = require('fs');
// const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB 连接字符串
const uri = process.env.MONGODB_URI;

// 创建 MongoClient
const client = new MongoClient(uri);

async function createSweetNotes(notes) {
    try {
        // 连接到 MongoDB
        await client.connect();
        const db = client.db("sweetnotes");
        const notesCollection = db.collection("notes");

        // 从环境变量中获取用户名
        // const username = process.env.LOCAL_USER || 'littlecat'; // 默认值为 littlecat
        const username = 'littlecat'; // 默认值为 littlecat

        // 为每个笔记添加用户名
        const notesWithUser = notes.map(note => ({
            ...note,
            username: username // 添加用户名
        }));

        // 将数据写入数据库
        await notesCollection.insertMany(notesWithUser);
        console.log('数据已成功写入 sweetnotes 数据库');

    } catch (err) {
        console.error("发生错误:", err);
    } finally {
        // 确保在完成时关闭客户端
        await client.close();
    }
}

createSweetNotes();
