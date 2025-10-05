const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Roles
const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true,  // Tên vai trò là bắt buộc
    unique: true,    // Tên vai trò phải là duy nhất
    trim: true       // Loại bỏ khoảng trắng thừa
  },
  description: {
    type: String,
    required: true,  // Mô tả vai trò là bắt buộc
    trim: true
  },
  permissions: {
    type: [String],  // Mảng quyền (danh sách các quyền)
    required: true   // Các quyền là bắt buộc
  },
  createdAt: {
    type: Date,
    default: Date.now // Thời gian tạo vai trò mặc định là thời gian hiện tại
  }
});

// Tạo model từ schema
const Role = mongoose.model('roles', roleSchema);

module.exports = Role;
