const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// 👇 Debug cấu hình (Giữ nguyên để kiểm tra)
console.log("CLOUDINARY CONFIG CHECK:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Đã nhận ✅" : "Chưa nhận ❌",
});

// 1. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình kho lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GamingGearShop', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// --- CÁC ROUTE UPLOAD ---

// ROUTE 1: Upload 1 ảnh (Dùng cho Ảnh đại diện, Ảnh biến thể)
// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Chưa chọn file nào!' });
  }

  // Cloudinary tự động trả về link trong req.file.path
  res.send({
    message: 'Image uploaded successfully',
    image: req.file.path, 
  });
});

// ROUTE 2: Upload NHIỀU ảnh (Dùng cho Album ảnh chi tiết)
// POST /api/upload/multiple
// upload.array('images', 10): Cho phép tối đa 10 ảnh, tên field là 'images'
router.post('/multiple', upload.array('images', 10), (req, res) => {
  try {
    // req.files (số nhiều) chứa danh sách các file đã lên Cloudinary
    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: 'Chưa chọn file nào!' });
    }

    // Lấy ra danh sách đường dẫn (URL)
    const imageUrls = req.files.map(file => file.path);

    res.status(200).json({
      message: 'Gallery uploaded successfully',
      images: imageUrls // Trả về mảng các đường link
    });

  } catch (error) {
    console.error("Lỗi upload nhiều ảnh:", error);
    res.status(500).json({ message: "Lỗi upload nhiều ảnh" });
  }
});

module.exports = router;