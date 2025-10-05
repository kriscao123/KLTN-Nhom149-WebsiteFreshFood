const mongoose = require('mongoose');

// Định nghĩa schema cho Product
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isActive: { type: Boolean, default: true },
  reorderLevel: { type: Number, default: 10 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  unitPrice: { type: Number, required: true },
  unitWeight: { type: Number, required: true },
  unitsInStock: { type: Number, default: 0 },
  unitsOnOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Export model
module.exports = mongoose.model('Product', productSchema);
