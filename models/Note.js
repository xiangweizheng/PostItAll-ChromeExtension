const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  noteId: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  domain: String,
  page: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', noteSchema);
