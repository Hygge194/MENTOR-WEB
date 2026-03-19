const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo một Pool kết nối tới database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test thử kết nối ngay khi file này được gọi
pool.getConnection()
    .then((connection) => {
        console.log('✅ Kết nối MySQL thành công với database:', process.env.DB_NAME);
        connection.release(); // Nhả kết nối lại cho Pool
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
    });

module.exports = pool;