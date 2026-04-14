const urlParams = new URLSearchParams(window.location.search);
const mentorId = urlParams.get('id');

const FIXED_PRICES = {
    'begin': 150000,
    'plus': 250000,
    'premium': 400000
};

async function loadMentorDetail() {
    const container = document.getElementById('mentor-detail');
    if (!mentorId) {
        container.innerHTML = `<div class="text-center py-20"><p class="text-red-500 font-medium">ID Mentor không hợp lệ.</p></div>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mentors/${mentorId}`);
        const result = await response.json();
        const mentor = result.mentor;
        const reviews = result.reviews || [];

        if (!mentor) {
            container.innerHTML = `<div class="text-center py-20"><p class="text-red-500 font-medium">Không tìm thấy Mentor.</p></div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-6xl mx-auto px-4 py-8">
                <div class="flex flex-col lg:flex-row gap-8">
                    
                    <!-- LEFT SIDEBAR: Mentor Profile (Sticky) -->
                    <div class="lg:w-1/3">
                        <div class="sticky top-8 bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                            <div class="relative inline-block">
                                <img src="https://mentor-web-1.onrender.com${mentor.avatar}" 
                                     class="w-40 h-40 rounded-full object-cover mx-auto ring-4 ring-indigo-50 shadow-lg" 
                                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=6366f1&color=fff'">
                                <div class="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                            </div>
                            
                            <h1 class="text-2xl font-black mt-6 text-slate-800">${mentor.full_name}</h1>
                            <p class="text-indigo-600 font-semibold mt-1 tracking-wide uppercase text-xs">${mentor.expertise || 'Chuyên gia hướng dẫn'}</p>
                            
                            <div class="flex items-center justify-center gap-4 mt-6">
                                <div class="text-center">
                                    <div class="flex items-center text-amber-500 font-bold text-xl">
                                        <span class="mr-1">★</span> ${parseFloat(mentor.avg_rating || 0).toFixed(1)}
                                    </div>
                                    <p class="text-slate-400 text-xs uppercase tracking-tighter">Đánh giá</p>
                                </div>
                                <div class="w-px h-8 bg-slate-100"></div>
                                <div class="text-center">
                                    <div class="text-slate-800 font-bold text-xl">${reviews.length}</div>
                                    <p class="text-slate-400 text-xs uppercase tracking-tighter">Học viên</p>
                                </div>
                            </div>

                            <div class="mt-8 pt-8 border-t border-slate-50">
                                <p class="text-slate-500 text-sm leading-relaxed">
                                    Cam kết hỗ trợ học viên tận tâm, giúp bạn đạt được mục tiêu nghề nghiệp nhanh chóng nhất.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT CONTENT: Booking & Reviews -->
                    <div class="lg:w-2/3">
                        <!-- Plan Selection Card -->
                        <div class="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
                            <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-bold text-slate-800">Chọn gói học tập</h2>
                            </div>

                            <div class="space-y-4 mb-8">
                                <!-- Beginner Plan -->
                                <label class="relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group hover:bg-slate-50 border-slate-100 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                                    <input type="radio" name="plan_type" value="begin" class="hidden peer" checked>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-bold text-slate-800 text-lg">Học viên Beginner</span>
                                            <span class="font-black text-emerald-600">150.000đ</span>
                                        </div>
                                        <p class="text-sm text-slate-500 italic mb-2">Dành cho người mới bắt đầu tìm hiểu</p>
                                        <ul class="text-sm text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                                            <li class="flex items-center">✅ Tài liệu & Video</li>
                                            <li class="flex items-center">✅ Chat hỏi đáp</li>
                                            <li class="flex items-center opacity-40">❌ Review 1-1</li>
                                        </ul>
                                    </div>
                                    <div class="ml-4 w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-all">
                                        <div class="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </label>

                                <!-- Plus Plan -->
                                <label class="relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group hover:bg-slate-50 border-slate-100 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50">
                                    <input type="radio" name="plan_type" value="plus" class="hidden peer">
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <div class="flex items-center gap-2">
                                                <span class="font-bold text-slate-800 text-lg">Gói Nâng cao (Plus)</span>
                                                <span class="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Phổ biến</span>
                                            </div>
                                            <span class="font-black text-blue-600">250.000đ</span>
                                        </div>
                                        <p class="text-sm text-slate-500 italic mb-2">Học bài bản có lộ trình và giải đáp</p>
                                        <ul class="text-sm text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                                            <li class="flex items-center">✅ 1 Buổi Call Q&A</li>
                                            <li class="flex items-center">✅ Lộ trình chi tiết</li>
                                            <li class="flex items-center">✅ Ưu tiên hỗ trợ</li>
                                        </ul>
                                    </div>
                                    <div class="ml-4 w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all">
                                        <div class="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </label>

                                <!-- Premium Plan -->
                                <label class="relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group hover:bg-slate-50 border-slate-100 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50">
                                    <input type="radio" name="plan_type" value="premium" class="hidden peer">
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <div class="flex items-center gap-2">
                                                <span class="font-bold text-slate-800 text-lg">Kèm 1-1 (Premium)</span>
                                                <span class="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Tốt nhất</span>
                                            </div>
                                            <span class="font-black text-purple-600">400.000đ</span>
                                        </div>
                                        <p class="text-sm text-slate-500 italic mb-2">Kèm cặp sát sao tối ưu kết quả</p>
                                        <ul class="text-sm text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                                            <li class="flex items-center">✅ Mentor kèm 1-1</li>
                                            <li class="flex items-center">✅ Mock Interview</li>
                                            <li class="flex items-center">✅ Sửa CV & Project</li>
                                        </ul>
                                    </div>
                                    <div class="ml-4 w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-all">
                                        <div class="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </label>
                            </div>

                            <div class="bg-slate-50 rounded-2xl p-6 mb-6">
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-500 font-medium">Tổng thanh toán:</span>
                                    <span id="price-summary" class="text-3xl font-black text-slate-900 transition-all">150.000đ</span>
                                </div>
                            </div>

                            <button onclick="handleBooking()" class="group relative w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-indigo-100 active:scale-[0.98]">
                                <span class="flex items-center justify-center gap-2">
                                    Xác nhận đặt lịch ngay
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </button>
                        </div>

                        <!-- REVIEWS SECTION -->
                        <div>
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    Đánh giá từ cộng đồng
                                    <span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs">${reviews.length}</span>
                                </h3>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${reviews.length > 0 ? reviews.map(r => `
                                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start mb-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100">
                                                    ${r.student_name ? r.student_name.charAt(0) : 'S'}
                                                </div>
                                                <div>
                                                    <div class="font-bold text-slate-800 text-sm leading-none">${r.student_name || 'Học viên ẩn danh'}</div>
                                                    <div class="text-amber-400 text-xs mt-1">
                                                        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p class="text-slate-600 text-sm leading-relaxed italic">"${r.comment}"</p>
                                    </div>
                                `).join('') : `
                                    <div class="col-span-2 py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <p class="text-slate-400 font-medium">Chưa có đánh giá nào cho Mentor này.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupPriceListener();

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="text-center py-20"><p class="text-red-500">Lỗi kết nối đến Server. Vui lòng thử lại sau.</p></div>`;
    }
}

function setupPriceListener() {
    const priceSummary = document.getElementById('price-summary');
    const planInputs = document.querySelectorAll('input[name="plan_type"]');

    planInputs.forEach(input => {
        // Lắng nghe sự kiện click vào label (input radio)
        input.addEventListener('change', () => {
            if (input.checked) {
                const price = FIXED_PRICES[input.value];
                priceSummary.style.opacity = '0';
                setTimeout(() => {
                    priceSummary.innerText = `${price.toLocaleString('vi-VN')}đ`;
                    priceSummary.style.opacity = '1';
                }, 100);
            }
        });
    });
}

// ... Giữ nguyên hàm handleBooking() như cũ ...