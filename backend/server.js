const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- IMPORT ROUTES ---
const orderRoutes = require("./routes/orderRoutes"); 
const uploadRoutes = require('./routes/uploadRoutes.js'); 
const productRoutes = require('./routes/productRoutes'); 
const userRoutes = require("./routes/userRoutes"); 
// 👇 1. THÊM DÒNG NÀY (Dùng require)
const couponRoutes = require("./routes/couponRoutes"); 

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API đang chạy ngon lành!');
});

// --- SỬ DỤNG ROUTES ---
app.use('/api/products', productRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/orders", orderRoutes); 
app.use('/api/upload', uploadRoutes);

// 👇 2. KÍCH HOẠT ROUTE COUPON
app.use('/api/coupons', couponRoutes);


const PORT = process.env.PORT || 5000;

app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || "sb") 
);

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});