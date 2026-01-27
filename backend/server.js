const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require("./routes/orderRoutes"); // 1. Import
const uploadRoutes = require('./routes/uploadRoutes.js'); // 👈 Import vào


// Import Routes
const productRoutes = require('./routes/productRoutes'); 
const userRoutes = require("./routes/userRoutes"); // <--- Dùng require cho đồng bộ


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
// 👇 THÊM DÒNG NÀY
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
// 👇 THÊM ĐOẠN NÀY ĐỂ TRẢ VỀ PAYPAL CLIENT ID
app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || "sb") 
);
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});