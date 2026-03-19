const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

console.log("👉 MÁY DÒ: Chuẩn bị import file routes..."); // Thêm dòng này
const authRoutes = require('./src/routes/authRoutes');
console.log("👉 MÁY DÒ: Import thành công! Chuẩn bị gắn vào /api/auth..."); // Thêm dòng này

const app = express();
app.use(cors());
app.use(express.json());

// Gắn route
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Mentor Platform API đang chạy ngon lành!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại cổng http://localhost:${PORT}`);
});