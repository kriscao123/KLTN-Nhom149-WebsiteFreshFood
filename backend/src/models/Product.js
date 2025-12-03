const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isActive: { type: Boolean, default: true },
  reorderLevel: { type: Number, default: 10 },

  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },

  unitPrice: { type: Number, required: true },
  unitWeight: { type: Number, required: true },
  unitsInStock: { type: Number, default: 0 },
  unitsOnOrder: { type: Number, default: 0 },

  listPrice: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  description: { type: String, default: "" },

  imageUrl: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
