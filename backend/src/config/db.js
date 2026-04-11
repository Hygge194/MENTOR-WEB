const mysql = require('mysql2/promise');

// Tạm thời bỏ qua dotenv để tránh lỗi đường dẫn tiếng Việt
const pool = mysql.createPool({
    host: 'mysql-2b95fedf-mentor1.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_N8RdJzzdHxwMe9NCmaG',
    database: 'defaultdb',
    port: 12082,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Log để kiểm tra
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối trực tiếp Aiven thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Vẫn lỗi kết nối:', err.message);
    });

module.exports = pool;