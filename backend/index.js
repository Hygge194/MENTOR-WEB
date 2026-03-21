const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const mentorRoutes = require('./src/routes/mentorRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const app = express();
const reviewRoutes = require('./src/routes/reviewRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
// Gắn route
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('Mentor Platform API đang chạy ngon lành!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại cổng http://localhost:${PORT}`);
});