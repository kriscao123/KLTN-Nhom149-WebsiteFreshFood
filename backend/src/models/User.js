const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true, 
    unique: true,    
    trim: true       
  },
  email: {
    type: String,
    required: true, 
    unique: true,    
    lowercase: true  
  },
  passwordHash: {
    type: String,
    required: true, 
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    }
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role', 
    required: true 
  },
  isActive: {
    type: Boolean,
    default: true 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
