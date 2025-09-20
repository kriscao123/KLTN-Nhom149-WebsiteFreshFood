const mongoose = require('mongoose');

module.exports = async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  for (let i = 1; i <= 10; i++) {
    try {
      await mongoose.connect(uri);
      console.log('Mongo connected');
      return;
    } catch (e) {
      console.log(`Mongo retry ${i}/10:`, e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw new Error('Mongo connection failed');
};
