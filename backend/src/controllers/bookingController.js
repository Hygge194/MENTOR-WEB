const db = require('../config/db');
const { sendNoti } = require('../utils/notiService');
const { suggestSlots } = require('../services/aiAgentService');

const createBooking = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { mentor_id, plan_type, booking_date } = req.body;

        // 1. Kiểm tra double booking (Trùng mentor_id + ngày nếu trạng thái hợp lệ)
        const [existingBookings] = await db.query(
            `SELECT * FROM bookings 
             WHERE mentor_id = ? 
             AND DATE(booking_date) = DATE(COALESCE(?, NOW())) 
             AND status IN ('pending', 'confirmed')`,
            [mentor_id, booking_date]
        );

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'Mentor đã có lịch học trong khung thời gian này!' });
        }

        // 1.5 Kiểm tra thời gian không được ở quá khứ
        const bookingTime = new Date(booking_date).getTime();
        const currentTime = new Date().getTime();
        if (bookingTime < currentTime) {
            return res.status(400).json({ message: 'Thời gian học không được ở trong quá khứ!' });
        }


        // 2. Tính số tiền
        let totalPrice = 0;
        if (plan_type === 'begin') {
            totalPrice = 15000;
        } else if (plan_type === 'plus') {
            totalPrice = 25000;
        } else if (plan_type === 'premium') {
            totalPrice = 50000;
        } else {
            return res.status(400).json({ message: 'Gói học không hợp lệ.' });
        }

        // 3. Khởi tạo booking với trạng thái pending
        const [result] = await db.query(
            `INSERT INTO bookings (student_id, mentor_id, plan_type, booking_date, total_price, status) 
             VALUES (?, ?, ?, COALESCE(?, NOW()), ?, 'pending')`,
            [studentId, mentor_id, plan_type, booking_date, totalPrice]
        );

        res.status(201).json({ 
            message: 'Tạo booking thành công. Chuyển sang tiến trình trả phí...',
            bookingId: result.insertId 
        });
    } catch (error) {
        console.error('Lỗi khi create Booking:', error);
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
//LẤY DANH SÁCH HỌC VIÊN ĐĂNG KÝ (Dành cho Mentor)
const getIncomingBookings = async (req, res) => {
    try {
        const mentorId = req.user.id; 

        const query = `
            SELECT b.id, b.plan_type, b.status, b.created_at, b.total_price, 
                   u.full_name as student_name, u.email as mentee_email
            FROM bookings b
            JOIN users u ON b.student_id = u.id 
            WHERE b.mentor_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.query(query, [mentorId]);

        res.status(200).json({
            message: 'Lấy danh sách yêu cầu thành công!',
            data: bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};
// ---  CẬP NHẬT TRẠNG THÁI (Chấp nhận / Từ chối) ---

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body; 
        const mentorId = req.user.id;

        const bId = parseInt(bookingId);
        // kiem tra xem lich hen co ton tai va dung la cua mentor nay khong
        const [bookingRows] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND mentor_id = ?',
            [bId, mentorId]
        );

        if (bookingRows.length === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy lịch hẹn hoặc bạn không có quyền duyệt yêu cầu này." 
            });
        }

        const [updateResult] = await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, bId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: "Không thể cập nhật database!" });
        }

        try {
            const message = status === 'confirmed' 
                ? "Mentor đã xác nhận lịch hẹn của bạn! Hãy chuẩn bị nhé." 
                : "Rất tiếc, Mentor đã từ chối lịch hẹn này.";
            
            if (typeof sendNoti === 'function') {
                await sendNoti(bookingRows[0].student_id, message, mentorId);
            }
        } catch (notiError) {
            console.error(" Lỗi gửi thông báo nhưng DB đã được cập nhật:", notiError.message);
        }

        return res.status(200).json({ 
            message: `Đã ${status === 'confirmed' ? 'Xác nhận' : 'Từ chối'} lịch hẹn thành công!` 
        });
    } catch (error) {
        console.error(" LỖI HỆ THỐNG:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật lịch." });
    }
};


// ---   LẤY LỊCH SỬ ĐẶT LỊCH (Dành cho Học viên) ---
const getMyBookings = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const query = `
            SELECT 
                b.id, 
                b.plan_type, 
                b.status, 
                b.created_at, 
                b.booking_date,
                u.full_name as mentor_name, 
                u.email as mentor_email
            FROM bookings b
            JOIN users u ON b.mentor_id = u.id
            WHERE b.student_id = ? 
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [studentId]);

        res.status(200).json({
            message: 'Lấy lịch sử thành công!',
            data: bookings
        });
    } catch (error) {
        console.error('Lỗi SQL:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const mentorId = req.user.id;

        const [result] = await db.query(
            "UPDATE bookings SET status = 'completed' WHERE id = ? AND mentor_id = ? AND status = 'confirmed'",
            [bookingId, mentorId]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Không thể hoàn thành (Lịch phải ở trạng thái 'confirmed' trước đó)." });
        }

        res.status(200).json({ message: "Chúc mừng bạn đã hoàn thành buổi dạy! Học viên hiện đã có thể đánh giá bạn." });

    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kết thúc buổi học." });
    }
};

const aiSuggest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { mentor_id } = req.body;

        const mentorConstraints = "Ưu tiên linh hoạt buổi sáng và chiều cuối tuần.";
        const menteeConstraints = "Đang đi làm hành chính, rảnh sau 19h và rảnh T7, CN.";

        // Mocks
        const menteeSchedule = [];
        const mentorSchedule = [];

        // Call Gemini
        const slots = await suggestSlots(mentorSchedule, menteeSchedule, mentorConstraints, menteeConstraints);

        res.status(200).json({
            message: "AI đã phân tích thành công",
            data: slots
        });
    } catch (e) {
        console.error("Lỗi AI Suggest:", e);
        res.status(500).json({ message: "AI bị lỗi hoặc bận." });
    }
};

module.exports = { createBooking, getIncomingBookings, 
    updateBookingStatus, getMyBookings, completeBooking, aiSuggest };