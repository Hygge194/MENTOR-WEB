const urlParams = new URLSearchParams(window.location.search);
const mentorId = urlParams.get('id');

// Định nghĩa bảng giá cố định ngay tại Frontend để hiển thị cho nhanh
const FIXED_PRICES = {
    'begin': 1200000,
    'plus': 250000,
    'premium': 400000
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
                    <img src="https://mentor-web-1.onrender.com${mentor.avatar}"
                         class="w-40 h-40 rounded-full object-cover mx-auto shadow-md border-4 border-white ring-4 ring-blue-50" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}'">
                    <h1 class="text-2xl font-black mt-4 text-gray-800">${mentor.full_name}</h1>
                    <div class="flex justify-center items-center mt-2 space-x-1">
                        <span class="text-yellow-400 text-xl">★</span>
                        <span class="font-bold text-gray-700">${parseFloat(mentor.avg_rating || 0).toFixed(1)}</span>

                    <!-- Social Proof Badge -->
                    ${parseFloat(mentor.avg_rating || 0) >= 4.5 && reviews.length > 0 ? `<span class="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mt-2 inline-block">⭐ Mentor Yêu Thích</span>` : ''}

                    <!-- Rating & Review Count -->
                    <div class="flex justify-center items-center mt-3 space-x-4 text-sm">
                        <div class="flex items-center space-x-1">
                            <span class="text-yellow-400 text-lg">★</span>
                            <span class="font-bold text-gray-700">${parseFloat(mentor.avg_rating || 0).toFixed(1)}</span>
                        </div>
                        <div class="text-gray-300">|</div>
                        <div class="flex items-center space-x-1">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6l4 4z"></path></svg>
                            <span class="font-bold text-gray-700">${reviews.length} đánh giá</span>
                        </div>
                    </div>
                    <p class="text-blue-600 font-medium text-sm mt-1">${mentor.expertise || 'Chuyên gia'}</p>

                    <p class="text-blue-600 font-medium text-sm mt-2">${mentor.expertise || 'Chuyên gia'}</p>

                    <!-- Share & Bookmark Buttons -->
                    <div class="mt-6 pt-6 border-t border-gray-200 flex justify-center items-center gap-2">
                        <button id="bookmark-btn" class="flex-1 text-sm font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100">
                            <svg class="w-4 h-4" id="bookmark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            <span id="bookmark-text">Lưu lại</span>
                        </button>
                        <div class="relative group">
                            <button id="share-btn" class="bg-gray-100 text-gray-700 text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                                <span>Chia sẻ</span>
                            </button>
                            <div id="share-options" class="absolute bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10" style="left: 50%; transform: translateX(-50%);">
                                <a id="facebook-share" href="#" target="_blank" class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                    <svg class="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                                    <span>Facebook</span>
                                </a>
                                <button id="copy-link-btn" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    <span id="copy-link-text">Copy link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="md:w-2/3">
                    <div class="bg-slate-50 p-8 rounded-3xl shadow-xl text-slate-800 mb-8 border border-slate-200">
                        <h4 class="font-bold text-xl mb-6 flex items-center text-slate-800">
                            <span class="mr-2">📅</span> Đặt lịch học nhanh
                        </h4>
                        <div class="space-y-5">
                            <div>
                                <label class="block text-sm font-medium mb-4 text-slate-600">Chọn gói học phù hợp với bạn:</label>
                                
                                <!-- Plan Cards -->
                                <div class="space-y-3">
                                    <!-- Beginner Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="begin" name="plan_type" value="begin" class="hidden peer" checked>
                                        <label for="begin" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-400 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-green-600 font-bold text-lg">🟢 Beginner – 150k</span>
                                                    <span class="text-sm text-gray-500 ml-2">(Phù hợp cho người mới bắt đầu)</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">150.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Học full nội dung khóa học<br>
                                                Truy cập tài liệu + video<br>
                                                Hỏi đáp qua chat (phản hồi chậm)<br>
                                                Không có review bài chi tiết<br>
                                            </div>
                                        </label>
                                    </div>

                                    <!-- Plus Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="plus" name="plan_type" value="plus" class="hidden peer">
                                        <label for="plus" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-blue-600 font-bold text-lg">🔵 Plus – 250k</span>
                                                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold ml-2">⭐ Recommended</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">250.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Bao gồm toàn bộ Beginner<br>
                                                Mentor review bài tập / project cơ bản<br>
                                                Hỏi đáp ưu tiên hơn<br>
                                                Có lộ trình học rõ ràng<br>
                                                1 buổi call ngắn (Q&A / giải đáp)<br>
                                            </div>
                                        </label>
                                    </div>

                                    <!-- Premium Plan -->
                                    <div class="plan-card relative">
                                        <input type="radio" id="premium" name="plan_type" value="premium" class="hidden peer">
                                        <label for="premium" class="block p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <span class="text-purple-600 font-bold text-lg">🟣 Premium – 400k</span>
                                                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold ml-2">🔥 Best value</span>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-bold text-lg text-slate-800">400.000đ</div>
                                                </div>
                                            </div>
                                            <div class="text-sm text-slate-600">
                                                Bao gồm toàn bộ Plus<br>
                                                Mentor kèm 1-1 (nhiều buổi hoặc theo tuần)<br>
                                                Review project chi tiết + sửa trực tiếp<br>
                                                Định hướng CV / career / mock interview<br>
                                                Support nhanh (priority)<br>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div id="price-summary" class="text-3xl font-black text-center py-2 bg-slate-100 rounded-xl text-slate-800">
                                150.000đ
                            </div>

                            <button onclick="handleBooking()" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg active:scale-95">
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
        setupSocialFeatures(mentorId);

    } catch (error) {
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối Server.</p>`;
    }
}

function setupPriceListener() {
    const priceSummary = document.getElementById('price-summary');
    const planRadios = document.querySelectorAll('input[name="plan_type"]');

    planRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                const price = FIXED_PRICES[radio.value];
                priceSummary.innerText = `${price.toLocaleString()}đ`;
            }
        });
    });
}

function setupSocialFeatures(mentorId) {
    const currentUrl = window.location.href;

    // --- Share Logic ---
    const facebookShareBtn = document.getElementById('facebook-share');
    if (facebookShareBtn) {
        facebookShareBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    }

    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentUrl).then(() => {
                const copyText = document.getElementById('copy-link-text');
                copyText.textContent = 'Đã copy!';
                copyLinkBtn.classList.add('text-green-600');
                setTimeout(() => {
                    copyText.textContent = 'Copy link';
                    copyLinkBtn.classList.remove('text-green-600');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Không thể copy link.');
            });
        });
    }

    // --- Bookmark Logic (using localStorage) ---
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const bookmarkIcon = document.getElementById('bookmark-icon');
    const bookmarkText = document.getElementById('bookmark-text');

    if (bookmarkBtn) {
        const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarkedMentors') || '[]');
        let bookmarks = getBookmarks();
        let isBookmarked = bookmarks.includes(mentorId);

        const updateButtonState = () => {
            if (isBookmarked) {
                bookmarkBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
                bookmarkBtn.classList.remove('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
                bookmarkIcon.setAttribute('fill', 'currentColor');
                bookmarkText.textContent = 'Đã lưu';
            } else {
                bookmarkBtn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                bookmarkBtn.classList.add('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
                bookmarkIcon.setAttribute('fill', 'none');
                bookmarkText.textContent = 'Lưu lại';
            }
        };

        updateButtonState(); // Set initial state

        bookmarkBtn.addEventListener('click', () => {
            bookmarks = getBookmarks();
            isBookmarked = bookmarks.includes(mentorId);

            const newBookmarks = isBookmarked ? bookmarks.filter(id => id !== mentorId) : [...bookmarks, mentorId];
            localStorage.setItem('bookmarkedMentors', JSON.stringify(newBookmarks));
            isBookmarked = !isBookmarked;
            updateButtonState();
        });
    }
}

async function handleBooking() {
    const planType = document.querySelector('input[name="plan_type"]:checked').value;
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
