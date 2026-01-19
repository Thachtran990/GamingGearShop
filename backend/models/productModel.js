const mongoose = require('mongoose');

// Định nghĩa cái khuôn: Một sản phẩm bao gồm những thông tin gì?
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true // Bắt buộc phải có tên
    },
    image: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: String, // Ví dụ: 'Chuột', 'Bàn phím'
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: { // Số lượng hàng trong kho
        type: Number,
        required: true,
        default: 0,
    },
    rating: { // Điểm đánh giá trung bình (ví dụ 4.5 sao)
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: { // Số lượng người đã đánh giá
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true // Tự động thêm ngày tạo (createdAt) và ngày sửa (updatedAt)
});

// Đóng gói cái khuôn này lại thành Model tên là "Product"
const Product = mongoose.model('Product', productSchema);

module.exports = Product;