const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// 👇 THÊM ĐOẠN NÀY ĐỂ DEBUG
console.log("CLOUDINARY CONFIG CHECK:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Đã nhận ✅" : "Chưa nhận ❌",
});

// 1. Cấu hình Cloudinary (Lấy từ file .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình kho lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GamingGearShop', // Tên thư mục sẽ tạo trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép ảnh
  },
});

const upload = multer({ storage: storage });

// 3. Route Upload
// Frontend sẽ gọi vào đây: POST /api/upload
// upload.single('image'): Nhận 1 file có tên field là 'image'
router.post('/', upload.single('image'), (req, res) => {
  // Sau khi upload xong, Cloudinary trả về thông tin trong req.file
  // Đường link ảnh nằm ở req.file.path
  res.send({
    message: 'Image uploaded successfully',
    image: req.file.path, // Trả link ảnh về cho Frontend dùng
  });
});

module.exports = router;