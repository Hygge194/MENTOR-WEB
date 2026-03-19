const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    console.log("👉 Đã gọi vào API Register với dữ liệu:", req.body); // DÒNG ĐỂ DEBUG

    try {
        const { full_name, email, password, role } = req.body;

        // Kiểm tra xem có nhận được dữ liệu không
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult] = await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role]
        );
        const newUserId = userResult.insertId;

        if (role === 'mentor') {
            await db.query('INSERT INTO mentors (user_id) VALUES (?)', [newUserId]);
            await db.query(`
                INSERT INTO plans (mentor_id, plan_type, price) VALUES 
                (?, 'Beginner', 0),
                (?, 'Plus', 0),
                (?, 'Premium', 0)
            `, [newUserId, newUserId, newUserId]);
        }

        res.status(201).json({ 
            message: 'Đăng ký tài khoản thành công!',
            userId: newUserId,
            role: role
        });

    } catch (error) {
        console.error('❌ Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const login = async (req, res) =>{
    console.log("👉 Đã gọi vào API Login với email:", req.body.email);
    try{
        const {email,password} =req.body;
        if(!email || !password){
            return res.status(400).json({message:'Nhập đủ email và mật khẩu nhé!'});
        }

        //tim nguoi dung bang email trong dâtbase
        const [users]=await db.query('SELECT *FROM users WHERE email=?', [email]);
        if(users.length===0){
            return res.status(401).json({message:'Email không tồn tại!'});
        }
        const user = users[0];

        //so sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message:'Mật khẩu không chính xác!'});
        }

        //tạo JWT token
        const token = jwt.sign(
            {id:user.id, role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:'1d'} // hsd 1 ngay
        );

        res.status(200).json({
            message:'Đăng nhập thành công!',
            token,
            user:{
                id:user.id,
                full_name:user.full_name,
                role:user.role
            }
        })
    }catch(error){
        console.error('❌ Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}
module.exports = { register, login }; 
