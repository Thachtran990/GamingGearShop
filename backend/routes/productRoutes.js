const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// Nếu ai vào đường dẫn gốc (/) thì gọi hàm lấy tất cả
router.get('/', getProducts);

// Nếu ai vào đường dẫn có ID (/:id) thì gọi hàm lấy 1 cái
router.get('/:id', getProductById);

module.exports = router;