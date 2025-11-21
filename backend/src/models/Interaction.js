const mongoose = require('mongoose');

// Định nghĩa schema cho Interaction
const interactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['view', 'add_to_cart', 'purchase'], required: true },
  value: { type: Number, default: 1 },  // Nếu có giá trị rating hoặc số lượng
  timestamp: { type: Date, default: Date.now },
});

// Tạo model từ schema
const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
