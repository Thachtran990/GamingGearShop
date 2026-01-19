const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- QUAN TRỌNG: Dòng này lúc nãy bị thiếu nè ---
const productRoutes = require('./routes/productRoutes'); 

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API đang chạy ngon lành!');
});

// Sử dụng Routes cho sản phẩm
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});