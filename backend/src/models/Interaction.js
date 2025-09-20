const mongoose = require('mongoose');
const interactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  type: { type: String, enum: ['view','add_to_cart','purchase','wishlist','rating','search'], index: true },
  value: Number,
  session_id: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);
