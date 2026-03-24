const db = require('../config/db');
const fs = require('fs');
const path = require('path');
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

        // 1. Lấy thông tin cơ bản của Mentor
        const queryInfo = `
        SELECT u.id, u.full_name, u.email, u.avatar, m.bio, 
            (SELECT IFNULL(AVG(rating), 0) FROM reviews WHERE mentor_id = u.id) as avg_rating
        FROM users u 
        JOIN mentors m ON u.id = m.user_id
        WHERE u.id = ?
    `;
        const [mentors] = await db.query(queryInfo, [mentorId]);

        if (mentors.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy Mentor này!' });
        }

        // 2. Lấy danh sách các gói học (Plans)
        const [plans] = await db.query(
            'SELECT plan_type, price, description FROM plans WHERE mentor_id = ?', 
            [mentorId]
        );

        // 3. LẤY DANH SÁCH ĐÁNH GIÁ (REVIEWS) - Phần mới thêm
        const queryReviews = `
            SELECT r.rating, r.comment, r.created_at, u.full_name as student_name 
            FROM reviews r
            JOIN users u ON r.student_id = u.id
            WHERE r.mentor_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.query(queryReviews, [mentorId]);

        // 4. Trả về đầy đủ dữ liệu cho Frontend
        res.status(200).json({
            message: 'Lấy chi tiết Mentor thành công!',
            mentor: mentors[0],
            plans: plans,
            reviews: reviews // Gửi thêm mảng reviews về
        });

    } catch (error) {
        console.error('❌ Lỗi khi lấy chi tiết Mentor:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};
const updateMentorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== 'mentor') {
            return res.status(403).json({ message: 'Forbidden: Yêu cầu quyền của Mentor.' });
        }

        const { bio, plans } = req.body;

        // --- PHẦN XỬ LÝ AVATAR (MỚI & CHUẨN) ---
        if (req.file) {
            const avatarUrl = `/uploads/${req.file.filename}`;

            // 1. Lấy ảnh cũ từ DB để chuẩn bị xóa file vật lý
            const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
            const oldAvatar = userRows[0]?.avatar;

            // 2. Cập nhật đường dẫn ảnh mới vào bảng users
            await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);

            // 3. Xóa file ảnh cũ khỏi thư mục uploads (nếu có)
            if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '../../', oldAvatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) console.error("❌ Không xóa được ảnh cũ:", err);
                        else console.log("✅ Đã xóa ảnh cũ vật lý thành công!");
                    });
                }
            }
        }
        // ---------------------------------------

        // 2. Cập nhật bảng mentors
        if (bio) {
            await db.query('UPDATE mentors SET bio = ? WHERE user_id = ?', [bio, userId]);
        }

        // 3. Cập nhật bảng plans
        if (plans && Array.isArray(plans)) {
            for (const plan of plans) {
                await db.query(
                    'UPDATE plans SET price = ?, description = ? WHERE mentor_id = ? AND plan_type = ?',
                    [plan.price, plan.description, userId, plan.plan_type]
                );
            }
        }

        res.status(200).json({ message: 'Cập nhật hồ sơ Mentor thành công.' });

    } catch (error) {
        console.error('❌ Lỗi hệ thống:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Không lấy được thông báo." });
    }
};
module.exports = { getAllMentors, getMentorById, updateMentorProfile, getMyNotifications };