const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require("./routes/orderRoutes"); // 1. Import

// Import Routes
const productRoutes = require('./routes/productRoutes'); 
const userRoutes = require("./routes/userRoutes"); // <--- Dùng require cho đồng bộ

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API đang chạy ngon lành!');
});

// Sử dụng Routes
app.use('/api/products', productRoutes);
app.use("/api/users", userRoutes); // <--- Đặt ở đây là chuẩn
app.use("/api/orders", orderRoutes); // 2. Thêm dòng này vào

const PORT = process.env.PORT || 5000;
// 👇 THÊM ĐOẠN NÀY ĐỂ TRẢ VỀ PAYPAL CLIENT ID
app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || "sb") 
);
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});