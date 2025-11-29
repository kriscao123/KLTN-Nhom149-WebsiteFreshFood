const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const router = express.Router();

// Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    // populate roleId → lấy roleName
    const users = await User.find()
      .populate({
        path: 'roleId',
        model: 'roles',          // tên model trong Role.js
        select: 'roleName'
      })
      .lean();

    const mapped = users.map(u => ({
      userId: String(u._id),
      username: u.username,
      email: u.email,
      roleId: u.roleId ? String(u.roleId._id) : null,
      role: u.roleId?.roleName || 'USER',   // <- FE dùng field này,
      phone: u.phone || '',
      address: u.address || ''
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
  }
});

// Lấy thông tin chi tiết người dùng theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('username email roleId');  // Lọc các trường cần thiết

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.json(user);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, roleId } = req.body;

    // Kiểm tra các trường hợp lỗi đầu vào
    if (!username || !email || !roleId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin (username, email, roleId)' });
    }

    const user = await User.findByIdAndUpdate(id, { username, email, roleId }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.json(user);  // Trả về thông tin người dùng đã cập nhật
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật người dùng' });
  }
});


module.exports = router;
