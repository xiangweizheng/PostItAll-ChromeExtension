require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect() {
  if (!client.isConnected()) {
    await client.connect();
  }
}

async function insertNote(note) {
  await connect();
  const notesCollection = client.db("stickyNotes").collection("notes");
  const result = await notesCollection.insertOne(note);
  return result.insertedId;
}

async function getNotesByUserId(userId) {
  await connect();
  const notesCollection = client.db("stickyNotes").collection("notes");
  const notes = await notesCollection.find({ userId }).toArray();
  return notes;
}

async function importNotes(userId, notes) {
  await connect();
  const notesCollection = client.db("stickyNotes").collection("notes");
  await notesCollection.insertMany(notes.map(note => ({ ...note, userId })));
}

async function closeConnection() {
  await client.close();
}

module.exports = {
  insertNote,
  getNotesByUserId,
  importNotes,
  closeConnection
};
