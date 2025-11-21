// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  orderItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true }
    }
  ],
  orderStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'SHIPPING','DELIVERED','CANCELLED'], default: 'PENDING' },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  shipAddress: { type: Object, required: true }, // Địa chỉ giao hàng
  totalAmount: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);
