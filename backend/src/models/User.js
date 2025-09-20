const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String, city: String, postalCode: String
},{ _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone_number: { type: String, unique: true, sparse: true },
  passwordHash: String,
  name: String,
  dietary_preferences: [String], // vegan, keto, ...
  allergies: [String],           // peanut, lactose, ...
  addresses: [addressSchema]
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
