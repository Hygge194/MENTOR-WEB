const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: POST /api/bookings
router.post('/', verifyToken, bookingController.createBooking);
// Xem danh sách yêu cầu gửi đến mình
router.get('/incoming', verifyToken, bookingController.getIncomingBookings);

// Cập nhật trạng thái (Duyệt/Từ chối)
router.patch('/:bookingId/status', verifyToken, bookingController.updateBookingStatus);
module.exports = router;