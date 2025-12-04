const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'roleId',
        model: 'roles',          
        select: 'roleName'
      })
      .lean();

    const mapped = users.map(u => ({
      userId: String(u._id),
      username: u.username,
      email: u.email,
      roleId: u.roleId ? String(u.roleId._id) : null,
      role: u.roleId?.roleName || 'USER',  
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
    const user = await User.findById(id).select('username email roleId');  

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
    const { username, phone,address, password} = req.body;
    let user;
    if(!username && !phone&&!address&&!password){
      return res.status(400).json({ message: 'Thiếu thông tin cập nhật' });
    } else if(password){
      const passwordHash=await bcrypt.hash(password,10);
      user = await User.findByIdAndUpdate(id, { passwordHash}, { new: true });
    } else{
      user = await User.findByIdAndUpdate(id, { username, phone,address}, { new: true });
    }
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const roleName=await Role.findById(user.roleId).then(role=>role.roleName);
    const userRes = {
                userId: user?._id,
                username: user?.username || (user?.email ? user.email.split("@")[0] : "user"),
                email: user?.email || null,
                phone: user?.phone || null,
                address: user?.address || null,
                role: roleName, 
            };

    return res.json(userRes);  
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật người dùng' });
  }
});


module.exports = router;
