const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role')
const AuthOtp = require('../models/AuthOtp');
const { sendEmail } = require('../utils/mailer');
const { sendSms } = require('../utils/sms');

const genCode = () => Math.floor(100000 + Math.random()*900000).toString();
const isEmail = (s) => /\S+@\S+\.\S+/.test(s);
const isPhone = (s) => /^[+\d][\d\s\-().]{6,}$/.test(s);

function normalizePhone(phone) {
  const cc = process.env.DEFAULT_COUNTRY_CODE || '+84';
  let p = (phone || '').replace(/[^\d+]/g,'');
  if (p.startsWith('0')) return cc + p.slice(1);
  return p;
}

/**
 * POST /api/auth/request-otp
 * body: { identifier, purpose } ; purpose = "register" | "login" (mặc định "register")
 */
router.post('/request-otp', async (req, res) => {
  const { identifier, purpose = 'register' } = req.body || {};
  if (!identifier) return res.status(400).json({ message: 'Thiếu identifier (email hoặc số điện thoại)' });

  let email = null, phone = null, channel = null;
  if (isEmail(identifier)) { email = identifier.toLowerCase(); channel = 'email'; }
  else if (isPhone(identifier)) { phone = normalizePhone(identifier); channel = 'sms'; }
  else return res.status(400).json({ message: 'Định dạng không hợp lệ' });

  // Kiểm tra tồn tại user trước khi gửi OTP
  const exists = await User.findOne(email ? { email } : { phone_number: phone }).lean();

  if (purpose === 'register' && exists) {
    return res.status(409).json({ message: 'Tài khoản đã tồn tại' });
  }
  if (purpose === 'login' && !exists) {
    return res.status(404).json({ message: 'Tài khoản chưa tồn tại' });
  }

  const code = genCode();
  const expiresAt = new Date(Date.now() + 5*60*1000); // 5 phút
  await AuthOtp.create({ email, phone_number: phone, channel, code, expiresAt });

  try {
    if (channel === 'email') {
      await sendEmail(email, 'Mã xác thực OTP', `<p>Mã OTP của bạn: <b>${code}</b> (hết hạn sau 5 phút)</p>`);
    } else {
      await sendSms(phone, `OTP: ${code} (expires in 5 minutes)`);
    }
  } catch (e) {
    return res.status(500).json({ message: 'Gửi OTP thất bại', detail: e.message });
  }

  res.json({ message: 'Đã gửi OTP', channel });
});

/** POST /api/auth/verify-otp
 * body: { identifier, code }
 * -> trả otpToken nếu đúng
 */
router.post('/verify-otp', async (req, res) => {
  const { identifier, code } = req.body || {};
  if (!identifier || !code) return res.status(400).json({ message: 'Thiếu identifier hoặc code' });

  let where = {};
  if (isEmail(identifier)) where.email = identifier.toLowerCase();
  else if (isPhone(identifier)) where.phone_number = normalizePhone(identifier);
  else return res.status(400).json({ message: 'Định dạng không hợp lệ' });

  const otp = await AuthOtp.findOne({ ...where, status: 'active' }).sort({ createdAt: -1 });
  if (!otp) return res.status(400).json({ message: 'Không tìm thấy OTP' });
  if (otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP đã hết hạn' });

  otp.attempts += 1;
  if (otp.code !== code) { await otp.save(); return res.status(400).json({ message: 'Mã OTP không đúng' }); }
  otp.status = 'used'; await otp.save();

  const otpToken = jwt.sign(where, process.env.JWT_SECRET, { expiresIn: '10m' });
  res.json({ otpToken });
});

/** POST /api/auth/register
 * body: { otpToken, name, password }
 * -> tạo user mới (email hoặc phone lấy từ otpToken)
 */
router.post('/register', async (req, res) => {
  const { otpToken, fullName, password, roleName } = req.body;
  if (!otpToken) return res.status(401).json({ message: 'Thiếu otpToken' });

  let ident;
  try { ident = jwt.verify(otpToken, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ message: 'otpToken không hợp lệ/đã hết hạn' }); }

  const where = ident.email ? { email: ident.email } : { phone_number: ident.phone_number };
  const exists = await User.findOne(where);
  if (exists) return res.status(409).json({ message: 'Tài khoản đã tồn tại' });

  const passwordHash = await bcrypt.hash(password, 10);
  const username=ident.email?ident.email:ident.phone_number
  const role=await Role.findOne({roleName:roleName})
  if (!role) {
            return res.status(400).json({ message: 'Role not found' });
        }
  const roleId=role._id
  const u = await User.create({ ...where, passwordHash, username, roleId, fullName });
  res.json({ id: u._id });
});

/** POST /api/auth/login
 * body: { email? , phone_number? , password }
 */
router.post('/login', async (req, res) => {
  const { email, phone_number, password } = req.body;
  const u = await User.findOne(email ? { email: email?.toLowerCase() } : { phone_number });
  if (!u) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
  const ok = await bcrypt.compare(password, u.passwordHash || '');
  if (!ok) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
  const token = jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, profile: { id: u._id, email: u.email, name: u.name, phone: u.phone } });
});

module.exports = router;
