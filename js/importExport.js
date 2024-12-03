// 导出便签
async function exportNotes(userId) {
  try {
    const notes = await getAllNotes(); // 假设有一个函数获取本地便签
    await fetch('/api/notes/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, notes })
    });
    alert('便签导出成功！');
  } catch (err) {
    console.error('导出失败:', err);
  }
}

// 导入便签
async function importNotes(userId) {
  try {
    const response = await fetch(`/api/notes/${userId}`);
    const data = await response.json();
    data.notes.forEach(note => {
      // 将云端数据保存到本地
      saveNoteToLocal(note); // 假设有一个函数保存便签到本地
    });
    alert('便签导入成功！');
  } catch (err) {
    console.error('导入失败:', err);
  }
}
