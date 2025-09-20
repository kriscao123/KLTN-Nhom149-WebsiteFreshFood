const mongoose = require('mongoose');

const authOtpSchema = new mongoose.Schema({
  email: { type: String, index: true, sparse: true },
  phone_number: { type: String, index: true, sparse: true },
  channel: { type: String, enum: ['email','sms'], required: true },
  code: { type: String, required: true },   // "123456"
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  status: { type: String, enum: ['active','used','expired'], default: 'active' }
}, { timestamps: true });

// TTL index tự xoá khi hết hạn (Mongo sẽ xóa khi expiresAt < now)
authOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthOtp', authOtpSchema);
