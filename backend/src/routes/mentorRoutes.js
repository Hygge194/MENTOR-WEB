const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', mentorController.getAllMentors);
router.get('/:id', mentorController.getMentorById);
router.put('/profile', verifyToken, mentorController.updateMentorProfile);

module.exports = router;
