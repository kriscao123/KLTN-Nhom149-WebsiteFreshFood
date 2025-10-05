const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa userSchema với các thuộc tính tương ứng với cơ sở dữ liệu
const userSchema = new Schema({
  username: {
    type: String,
    required: true, // username là bắt buộc
    unique: true,   // username phải là duy nhất
    trim: true      // loại bỏ khoảng trắng thừa
  },
  email: {
    type: String,
    required: true, // email là bắt buộc
    unique: true,   // email phải là duy nhất
    lowercase: true // chuyển email về chữ thường
  },
  passwordHash: {
    type: String,
    required: true, // password là bắt buộc, sẽ được mã hóa
  },
  fullName: {
    type: String,
    required: true, // fullName là bắt buộc
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
    },
    ward: {
      type: String,
      trim: true
    }
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role', // Liên kết với collection 'roles'
    required: true // roleId là bắt buộc
  },
  isActive: {
    type: Boolean,
    default: true // Mặc định tài khoản là active
  },
  createdAt: {
    type: Date,
    default: Date.now // Mặc định thời gian tạo tài khoản là thời gian hiện tại
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

// Tạo model từ userSchema
const User = mongoose.model('users', userSchema);

module.exports = User;
