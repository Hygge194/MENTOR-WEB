const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const mentorRoutes = require('./src/routes/mentorRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/mentors', mentorRoutes);
// Gắn route
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Mentor Platform API đang chạy ngon lành!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại cổng http://localhost:${PORT}`);
});