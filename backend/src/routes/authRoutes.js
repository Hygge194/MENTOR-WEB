console.log("👉 MÁY DÒ: Đã chạy thành công vào file authRoutes.js"); // Thêm dòng này

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;