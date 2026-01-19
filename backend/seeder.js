const mongoose = require('mongoose');
const dotenv = require('dotenv');
const products = require('./data/products');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // 1. Xóa sạch dữ liệu cũ để tránh trùng lặp
        await Product.deleteMany();

        // 2. Nhét danh sách sản phẩm mới vào
        await Product.insertMany(products);

        console.log('Đã nhập dữ liệu thành công!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();
        console.log('Đã xóa sạch dữ liệu!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

// Kiểm tra xem người dùng muốn Nhập hay Xóa
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}