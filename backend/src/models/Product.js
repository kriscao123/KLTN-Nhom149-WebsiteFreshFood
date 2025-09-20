const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  sku: { type: String, index: true },
  title: { type: String, index: 'text' },
  description: { type: String, index: 'text' },
  brand: String,
  origin_country: String,
  storage_temp: String,
  shelf_life_days: Number,
  images: [String],
  diet_tags: [String],
  allergens: [String],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
},{ timestamps: true });

productSchema.index({ diet_tags: 1 });
productSchema.index({ allergens: 1 });

module.exports = mongoose.model('Product', productSchema);
