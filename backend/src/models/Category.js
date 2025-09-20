const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, index: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
},{ timestamps: true });
module.exports = mongoose.model('Category', categorySchema);
