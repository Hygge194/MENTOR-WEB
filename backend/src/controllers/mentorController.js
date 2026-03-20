const db = require('../config/db');

// --- HÀM 1: LẤY DANH SÁCH MENTOR ---
const getAllMentors = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.full_name, u.avatar, m.bio, m.avg_rating 
            FROM users u 
            JOIN mentors m ON u.id = m.user_id
            ORDER BY m.avg_rating DESC
        `;
        const [mentors] = await db.query(query);

        res.status(200).json({
            message: 'Lấy danh sách Mentor thành công!',
            total: mentors.length,
            data: mentors
        });

    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}; 

// --- HÀM 2: LẤY CHI TIẾT 1 MENTOR ---
const getMentorById = async (req, res) => {
    try {
        const mentorId = req.params.id;

        const queryInfo = `
            SELECT u.id, u.full_name, u.email, u.avatar, m.bio, m.avg_rating 
            FROM users u 
            JOIN mentors m ON u.id = m.user_id
            WHERE u.id = ?
        `;
        const [mentors] = await db.query(queryInfo, [mentorId]);

        if (mentors.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy Mentor này!' });
        }

        const [plans] = await db.query('SELECT plan_type, price, description FROM plans WHERE mentor_id = ?', [mentorId]);

        res.status(200).json({
            message: 'Lấy chi tiết Mentor thành công!',
            mentor: mentors[0],
            plans: plans
        });

    } catch (error) {
        console.error('❌ Lỗi khi lấy chi tiết Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}; 


module.exports = { getAllMentors, getMentorById };