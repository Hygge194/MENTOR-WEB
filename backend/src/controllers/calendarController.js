const { google } = require('googleapis');
const db = require('../config/db');

// Khởi tạo OAuth2 Client (Lấy Credentials từ biến môi trường)
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:12082/api/calendar/oauth-callback' // Fallback cho DEV
);

// Mảng quyền yêu cầu khi liên kết
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly', // Đọc lịch rảnh
    'https://www.googleapis.com/auth/calendar.events',    // Tạo sự kiện & Meet
    'openid', 'email', 'profile'
];

/**
 * Endpoint điều hướng người dùng tới trang Đăng nhập Google
 */
const getAuthUrl = (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ verifyToken của app mình
        // Đính kèm ID của user vào tham số trạng thái (state) để sau khi Google chuyển về, mình biết token này của ai
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Cần thiết để lấy refresh_token
            prompt: 'consent',      // Bắt buộc Google trả về refresh_token mỗi lần ấn liên kết
            scope: SCOPES,
            state: userId.toString() 
        });
        res.status(200).json({ authUrl: url });
    } catch (e) {
        console.error("Lỗi Google Auth URL:", e);
        res.status(500).json({ message: "Không tạo được đường dẫn liên kết" });
    }
};

/**
 * Vòng lặp phản hồi: Google đẩy code về Endpoint này
 */
const oauthCallback = async (req, res) => {
    try {
        const { code, state } = req.query; // state chính là userId
        if (!code || !state) {
            return res.status(400).send("Thiếu tham số xác thực từ Google.");
        }

        const userId = parseInt(state, 10);

        // Đổi code lấy Access & Refresh Token
        const { tokens } = await oauth2Client.getToken(code);
        
        // Cập nhật Token vào Database
        let updateQuery = 'UPDATE users SET google_access_token = ?';
        let queryParams = [tokens.access_token];

        if (tokens.refresh_token) {
            updateQuery += ', google_refresh_token = ?';
            queryParams.push(tokens.refresh_token);
        }
        
        updateQuery += ' WHERE id = ?';
        queryParams.push(userId);

        await db.query(updateQuery, queryParams);

        // Thành công -> Chuyển hướng người dùng về trang giao diện với cờ success
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mentor-web-1.onrender.com' 
            : 'http://localhost:5500'; // Đổi theo cổng Frontend nếu lướt cục bộ
        
        res.send(`<script>
            alert("Đã kết nối Google Calendar thành công!");
            window.location.href = "/";
        </script>`);
        
    } catch (error) {
        console.error("Lỗi callback:", error);
        res.status(500).send("Lỗi khi kết nối Google. Kênh token có thể không hợp lệ.");
    }
};

module.exports = { getAuthUrl, oauthCallback, oauth2Client };
