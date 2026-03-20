const db = require('../config/db');

// ---  LẤY DANH SÁCH MENTOR (CÓ LỌC & PHÂN TRANG) ---
const getAllMentors = async (req, res) => {
    try {
        // 1. Lấy các tham số từ URL (req.query), thiết lập giá trị mặc định nếu người dùng không truyền
        const page = parseInt(req.query.page) || 1;       // Mặc định là trang 1
        const limit = parseInt(req.query.limit) || 10;    // Mặc định lấy 10 người/trang
        const expertise = req.query.expertise;            // Lọc theo môn học
        const search = req.query.search;                  // Tìm theo tên

        // 2. Tính toán OFFSET
        const offset = (page - 1) * limit;

        // 3. Xây dựng câu lệnh SQL "động" (Dynamic SQL)
        let query = `
            SELECT u.id, u.full_name, u.avatar, m.bio, m.expertise, m.avg_rating 
            FROM users u 
            JOIN mentors m ON u.id = m.user_id
            WHERE 1=1
        `;
        const queryParams = [];

        // Nếu có truyền chữ tìm kiếm tên
        if (search) {
            query += ` AND u.full_name LIKE ?`;
            queryParams.push(`%${search}%`); // Thêm % để tìm chuỗi chứa từ khóa ở bất kỳ đâu
        }

        // Nếu có yêu cầu lọc theo môn học
        if (expertise) {
            query += ` AND m.expertise = ?`;
            queryParams.push(expertise);
        }

        // 4. Thêm điều kiện Sắp xếp và Phân trang (BẮT BUỘC nằm ở cuối câu SQL)
        query += ` ORDER BY m.avg_rating DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        // 5. Thực thi câu lệnh SQL
        const [mentors] = await db.query(query, queryParams);

        // (Tùy chọn nâng cao) Đếm tổng số lượng Mentor thỏa mãn điều kiện để UI biết có bao nhiêu trang
        let countQuery = `SELECT COUNT(*) as totalItems FROM users u JOIN mentors m ON u.id = m.user_id WHERE 1=1`;
        const countParams = [];
        if (search) { countQuery += ` AND u.full_name LIKE ?`; countParams.push(`%${search}%`); }
        if (expertise) { countQuery += ` AND m.expertise = ?`; countParams.push(expertise); }
        
        const [totalResult] = await db.query(countQuery, countParams);
        const totalItems = totalResult[0].totalItems;
        const totalPages = Math.ceil(totalItems / limit);

        // 6. Trả kết quả về cho người dùng
        res.status(200).json({
            message: 'Lấy danh sách Mentor thành công!',
            pagination: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit
            },
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