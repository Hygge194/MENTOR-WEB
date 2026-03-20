const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Tạo đặt lịch mới
router.post('/', verifyToken, bookingController.createBooking);

// 2. Mentor xem danh sách học viên chờ duyệt
router.get('/incoming', verifyToken, bookingController.getIncomingBookings);

// 3.Học viên xem lịch sử đặt lịch của mình
router.get('/my-requests', verifyToken, bookingController.getMyBookings);

// 4. Cập nhật trạng thái 
router.patch('/:bookingId/status', verifyToken, bookingController.updateBookingStatus);

module.exports = router;