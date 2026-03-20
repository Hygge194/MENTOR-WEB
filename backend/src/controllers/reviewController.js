const db = require('../config/db');

const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id, rating, comment } = req.body;

        // 1. Kiểm tra xem buổi học này có tồn tại và đã được 'accepted' chưa
        const [booking] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "accepted"',
            [booking_id, userId]
        );

        if (booking.length === 0) {
            return res.status(400).json({ message: "Bạn chỉ có thể đánh giá những buổi học đã được chấp nhận!" });
        }

        const mentorId = booking[0].mentor_id;

        // 2. Lưu đánh giá vào bảng reviews
        await db.query(
            'INSERT INTO reviews (booking_id, user_id, mentor_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [booking_id, userId, mentorId, rating, comment]
        );

        // 3. TỰ ĐỘNG CẬP NHẬT avg_rating TRONG BẢNG mentors
        // Tính toán trung bình cộng mới
        const [avgResult] = await db.query(
            'SELECT AVG(rating) as average FROM reviews WHERE mentor_id = ?',
            [mentorId]
        );
        const newAvg = avgResult[0].average || 0;

        // Cập nhật lại vào bảng mentors
        await db.query('UPDATE mentors SET avg_rating = ? WHERE user_id = ?', [newAvg, mentorId]);

        res.status(201).json({ 
            message: "Cảm ơn bạn đã đánh giá!", 
            new_rating: newAvg.toFixed(1) 
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Bạn đã đánh giá buổi học này rồi!" });
        }
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

module.exports = { createReview };