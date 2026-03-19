console.log("👉 MÁY DÒ: Đã chạy thành công vào file authRoutes.js"); // Thêm dòng này

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
// Thêm 3 dòng này vào để test thử bằng phương thức GET
router.get('/test', (req, res) => {
    res.send("🎉 CHÚC MỪNG! THUNDER CLIENT ĐÃ TÌM THẤY ĐƯỜNG VÀO ROUTER!");
});
module.exports = router;