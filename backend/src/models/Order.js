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
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  shipAddress: { type: Object, required: true }, 
  totalAmount: { type: Number, required: true },
  sepay: {
    paymentCode: { type: String, index: true },     // CODE ĐỂ MATCH WEBHOOK (data.code)
    qrUrl: { type: String },
    paidAt: { type: Date },
    referenceCode: { type: String },                // data.referenceCode
    rawWebhook: { type: Object }                    // LƯU LOG (TUỲ CHỌN)
  }
});

module.exports = mongoose.model('Order', orderSchema);
