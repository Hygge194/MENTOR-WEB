const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', mentorController.getAllMentors);
router.get('/:id', mentorController.getMentorById);
router.put('/profile', verifyToken, upload.single('avatar'), mentorController.updateMentorProfile);

module.exports = router;
