const { sendNoti } = require('../utils/notiService');
const createBooking = async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { mentor_id, plan_type } = req.body;

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

        await db.query(
            `INSERT INTO bookings (student_id, mentor_id, plan_type, total_price, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [studentId, mentor_id, plan_type, totalPrice, 'pending']
        );

        res.status(201).json({ message: 'Đặt lịch thành công!' });
    } catch (error) {
        console.error('❌ Lỗi:', error);
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

const db = require('../config/db'); 

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
            console.error("⚠️ Lỗi gửi thông báo nhưng DB đã được cập nhật:", notiError.message);
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
        console.error('❌ Lỗi SQL:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const mentorId = req.user.id;

        const [result] = await db.query(
            'UPDATE bookings SET status = "completed" WHERE id = ? AND mentor_id = ? AND status = "confirmed"',
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
module.exports = { createBooking, getIncomingBookings, 
    updateBookingStatus, getMyBookings, completeBooking };