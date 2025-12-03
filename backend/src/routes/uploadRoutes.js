const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');

const router = express.Router();

// không lưu file ra ổ đĩa, chỉ giữ trong RAM
const storage = multer.memoryStorage();
const upload = multer({ storage });

// cấu hình S3 (lấy từ .env)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, 
});

// POST /api/upload/single
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME; 
    if (!bucket) {
      return res.status(500).json({ message: 'Thiếu cấu hình AWS_S3_BUCKET_NAME' });
    }

    const file = req.file;
    const ext = file.originalname.split('.').pop(); // lấy đuôi file
    const key = `img/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const params = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      };

    const result = await s3.upload(params).promise();

    return res.status(201).json({
      imageUrl: result.Location, // URL public của ảnh
      key: result.Key,
    });
  } catch (err) {
    console.error('Lỗi upload S3:', err);
    return res.status(500).json({ message: 'Upload ảnh thất bại', error: err.message });
  }
});

module.exports = router;
