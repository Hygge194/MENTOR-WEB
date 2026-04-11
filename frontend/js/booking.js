const urlParams = new URLSearchParams(window.location.search);
const mentorId = urlParams.get('id');

// Định nghĩa bảng giá cố định ngay tại Frontend để hiển thị cho nhanh
const FIXED_PRICES = {
    'begin': 15000,
    'plus': 25000,
    'premium': 50000
};

async function loadMentorDetail() {
    const container = document.getElementById('mentor-detail');
    if (!mentorId) {
        container.innerHTML = `<p class="text-red-500 text-center">ID Mentor không hợp lệ.</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mentors/${mentorId}`);
        const result = await response.json();
        const mentor = result.mentor;
        const reviews = result.reviews || [];

        if (!mentor) {
            container.innerHTML = `<p class="text-red-500 text-center">Không tìm thấy Mentor.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="md:flex gap-10">
                <div class="md:w-1/3 text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <img src="https://mentor-web-1.onrender.com${mentor.avatar}" 
                         class="w-40 h-40 rounded-full object-cover mx-auto shadow-md border-4 border-white ring-4 ring-blue-50" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}'">
                    <h1 class="text-2xl font-black mt-4 text-gray-800">${mentor.full_name}</h1>
                    <div class="flex justify-center items-center mt-2 space-x-1">
                        <span class="text-yellow-400 text-xl">★</span>
                        <span class="font-bold text-gray-700">${parseFloat(mentor.avg_rating || 0).toFixed(1)}</span>
                    </div>
                    <p class="text-blue-600 font-medium text-sm mt-1">${mentor.expertise || 'Chuyên gia'}</p>
                </div>
                
                <div class="md:w-2/3">
                    <div class="bg-blue-600 p-8 rounded-3xl shadow-xl text-white mb-8">
                        <h4 class="font-bold text-xl mb-6 flex items-center">
                            <span class="mr-2">📅</span> Đặt lịch học nhanh
                        </h4>
                        <div class="space-y-5">
                            <div>
                                <label class="block text-sm font-medium mb-2 opacity-80">Chọn gói học:</label>
                                <select id="plan_type" class="w-full p-3 rounded-xl bg-white border-none outline-none text-gray-800 font-bold focus:ring-4 focus:ring-blue-300">
                                    <option value="begin">Beginner (15.000đ)</option>
                                    <option value="plus">PLUS (25.000đ)</option>
                                    <option value="premium">PREMIUM (50.000đ)</option>
                                </select>
                            </div>
                            <div id="price-summary" class="text-3xl font-black text-center py-2">
                                15.000đ
                            </div>
                            <button onclick="handleBooking()" class="w-full bg-white text-blue-600 py-4 rounded-2xl font-black hover:bg-gray-100 transition shadow-lg active:scale-95">
                                XÁC NHẬN ĐẶT LỊCH
                            </button>
                        </div>
                    </div>

                    <div class="mt-10">
                        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <span class="mr-2 text-2xl">💬</span> Đánh giá từ học viên (${reviews.length})
                        </h3>
                        <div id="reviews-list" class="space-y-4">
                            ${reviews.length > 0 ? reviews.map(r => `
                                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                ${r.student_name ? r.student_name.charAt(0) : 'H'}
                                            </div>
                                            <span class="font-bold text-gray-800">${r.student_name || 'Học viên'}</span>
                                        </div>
                                        <span class="text-yellow-400 font-bold">★ ${r.rating}</span>
                                    </div>
                                    <p class="text-gray-600 text-sm italic">"${r.comment}"</p>
                                </div>
                            `).join('') : '<p class="text-gray-400 italic">Chưa có đánh giá nào.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupPriceListener();

    } catch (error) {
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối Server.</p>`;
    }
}

function setupPriceListener() {
    const planSelect = document.getElementById('plan_type');
    const priceSummary = document.getElementById('price-summary');
    if(!planSelect) return;

    planSelect.addEventListener('change', () => {
        const price = FIXED_PRICES[planSelect.value];
        priceSummary.innerText = `${price.toLocaleString()}đ`;
    });
}

async function handleBooking() {
    const planType = document.getElementById('plan_type').value;
    const token = localStorage.getItem('accessToken');

    if (!token) {
        alert("Vui lòng đăng nhập để đặt lịch!");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mentor_id: mentorId,
                plan_type: planType
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Đặt lịch thành công! Đang chờ Mentor xác nhận.");
            window.location.href = 'dashboard-student.html';
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        alert("Không thể kết nối đến server.");
    }
}

// CHỈ GỌI 1 LẦN DUY NHẤT KHI LOAD FILE
loadMentorDetail();