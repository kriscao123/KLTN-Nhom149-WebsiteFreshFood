const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true,  
    unique: true,   
    trim: true      
  },
  description: {
    type: String,
    required: true,  
    trim: true
  },
  permissions: {
    type: [String],  
    required: true   
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

const Role = mongoose.model('roles', roleSchema);

module.exports = Role;
