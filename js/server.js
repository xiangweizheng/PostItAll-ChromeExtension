const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// 连接到 MongoDB Atlas
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/stickyNotes?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 中间件
app.use(bodyParser.json());
app.use('/api', notesRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
