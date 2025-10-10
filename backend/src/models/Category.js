const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, index: true },
  parentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
},{ timestamps: true });
module.exports = mongoose.model('Category', categorySchema);
