const API_URL = 'http://localhost:5000/api';

// 1. Hàm Đăng ký
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
    }
}

// 2. Hàm Đăng nhập
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Lưu token và thông tin user vào LocalStorage
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.full_name);
        }
        return data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
    }
}

// 3. Hàm Đăng xuất
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 4. Hàm kiểm tra đã đăng nhập chưa (Dùng để bảo vệ các trang dashboard)
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}