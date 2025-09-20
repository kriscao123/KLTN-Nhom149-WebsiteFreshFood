const mongoose = require('mongoose');
const variantSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  unit: { type: String, enum: ['g', 'kg', 'ml', 'l', 'pack'] },
  size_value: Number,
  barcode: String,
  price: Number,
  currency: { type: String, default: 'VND' },
  stock_qty: Number,
  in_stock: { type: Boolean, default: true }
},{ timestamps: true });

module.exports = mongoose.model('ProductVariant', variantSchema);
