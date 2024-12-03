const express = require('express');
const router = express.Router();
const dbManager = require('../js/dbManager');

// 创建便签
router.post('/notes', async (req, res) => {
  try {
    const { userId, noteId, content } = req.body;
    const note = {
      userId,
      noteId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const insertedId = await dbManager.insertNote(note);
    res.json({ success: true, noteId: insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取用户的所有便签
router.get('/notes/:userId', async (req, res) => {
  try {
    const notes = await dbManager.getNotesByUserId(req.params.userId);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导入便签
router.post('/notes/import', async (req, res) => {
  try {
    const { userId, notes } = req.body;
    await dbManager.importNotes(userId, notes);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;