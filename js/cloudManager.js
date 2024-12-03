const cloudManager = {
  add: async function(note, callback) {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      });
      const data = await response.json();
      callback(data.error || "");
    } catch (err) {
      callback(err.message);
    }
  },

  getAll: async function(userId, callback) {
    try {
      const response = await fetch(`/api/notes/${userId}`);
      const data = await response.json();
      callback(data.notes || []);
    } catch (err) {
      callback([]);
    }
  }
};
