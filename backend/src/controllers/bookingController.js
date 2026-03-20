const db = require('../config/db');

const createBooking = async (req, res) => {
    try {
        // Lấy ID học viên từ Token (người đang đăng nhập)
        const userId = req.user.id || req.user.userId; 
        const { mentor_id, plan_type } = req.body;

        // 1. Kiểm tra Mentor có tồn tại không
        const [mentor] = await db.query('SELECT * FROM mentors WHERE user_id = ?', [mentor_id]);
        if (mentor.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy Mentor này.' });
        }

        // 2. Kiểm tra Mentor có cung cấp gói học (Plan) này không
        const [plan] = await db.query(
            'SELECT * FROM plans WHERE mentor_id = ? AND plan_type = ?', 
            [mentor_id, plan_type]
        );
        if (plan.length === 0) {
            return res.status(400).json({ message: 'Mentor không cung cấp gói học này.' });
        }

        // 3. Lưu vào bảng bookings
        await db.query(
            'INSERT INTO bookings (user_id, mentor_id, plan_type) VALUES (?, ?, ?)',
            [userId, mentor_id, plan_type]
        );

        res.status(201).json({ message: 'Gửi yêu cầu đặt lịch thành công! Đang chờ Mentor xác nhận.' });

    } catch (error) {
        console.error('Lỗi khi tạo booking:', error);
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
//LẤY DANH SÁCH HỌC VIÊN ĐĂNG KÝ (Dành cho Mentor)
const getIncomingBookings = async (req, res) => {
    try {
        const mentorId = req.user.id; // ID của Mentor đang đăng nhập

        const query = `
            SELECT b.id, b.plan_type, b.status, b.created_at, u.full_name as mentee_name, u.email as mentee_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.mentor_id = ?
            ORDER BY b.created_at DESC
        `;
        const [incoming] = await db.query(query, [mentorId]);

        res.status(200).json({
            message: 'Lấy danh sách yêu cầu thành công!',
            data: incoming
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
// ---  CẬP NHẬT TRẠNG THÁI (Chấp nhận / Từ chối) ---
const updateBookingStatus = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body; // 'accepted' hoặc 'rejected'

        // Kiểm tra xem booking này có phải gửi cho Mentor này không
        const [booking] = await db.query('SELECT * FROM bookings WHERE id = ? AND mentor_id = ?', [bookingId, mentorId]);
        
        if (booking.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu này của bạn.' });
        }

        // Cập nhật trạng thái
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

        res.status(200).json({ message: `Bạn đã ${status === 'accepted' ? 'ĐỒNG Ý' : 'TỪ CHỐI'} yêu cầu này.` });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
module.exports = { createBooking, getIncomingBookings, updateBookingStatus };