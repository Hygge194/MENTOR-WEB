const db = require('../config/db');

// --- HÀM 1: LẤY DANH SÁCH MENTOR ---
const getAllMentors = async (req, res) => {
    try {
        const { expertise } = req.query; // Lấy môn học từ thanh địa chỉ (ví dụ: ?expertise=Nodejs)
        
        let query = `
            SELECT u.id, u.full_name, u.avatar, m.bio, m.expertise, m.avg_rating 
            FROM users u 
            JOIN mentors m ON u.id = m.user_id
        `;
        
        let params = [];
        if (expertise) {
            query += ` WHERE m.expertise = ?`;
            params.push(expertise);
        }
        
        query += ` ORDER BY m.avg_rating DESC`;

        const [mentors] = await db.query(query, params);

        res.status(200).json({
            message: 'Lấy danh sách Mentor thành công!',
            data: mentors
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
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
const updateMentorProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.user?.sub;
        const role = req.user.role;
        console.log("--- DEBUG UPDATE ---");
        console.log("User ID từ Token:", userId);
        console.log("Role từ Token:", role);
        // Xác thực phân quyền: Từ chối các role không hợp lệ
        if (role !== 'mentor') {
            return res.status(403).json({ message: 'Forbidden: Yêu cầu quyền truy cập của Mentor.' });
        }

        const { avatar, bio, plans } = req.body;

        // 1. Cập nhật bảng users
        if (avatar) {
            await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
        }

        // 2. Cập nhật bảng mentors
        if (bio) {
            await db.query('UPDATE mentors SET bio = ? WHERE user_id = ?', [bio, userId]);
        }

        // 3. Cập nhật bảng plans
        if (plans && Array.isArray(plans)) {
            for (const plan of plans) {
                // THÊM DÒNG NÀY ĐỂ KIỂM TRA
                console.log(`Đang cập nhật Plan: ${plan.plan_type} cho Mentor ID: ${userId}`);
                
                const [result] = await db.query(
                    'UPDATE plans SET price = ?, description = ? WHERE mentor_id = ? AND plan_type = ?',
                    [plan.price, plan.description, userId, plan.plan_type]
                );
                
                // KIỂM TRA XEM CÓ DÒNG NÀO ĐƯỢC CẬP NHẬT KHÔNG
                console.log(`Số dòng bị ảnh hưởng: ${result.affectedRows}`);
            }
        }

        res.status(200).json({ message: 'Cập nhật hồ sơ Mentor thành công.' });

    } catch (error) {
        console.error('Lỗi hệ thống trong quá trình cập nhật hồ sơ Mentor:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};
module.exports = { getAllMentors, getMentorById, updateMentorProfile };