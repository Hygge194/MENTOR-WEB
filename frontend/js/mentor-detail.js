document.addEventListener('DOMContentLoaded', () => {
    fetchMentorDetail();
});

// PHẦN 1: XỬ LÝ THÔNG TIN CHI TIẾT MENTOR

async function fetchMentorDetail() {
    const container = document.getElementById('mentor-detail');
    
    // Lấy ID từ URL (VD: mentor-detail.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const mentorId = urlParams.get('id');

    if (!mentorId) {
        container.innerHTML = `<p class="text-red-500 font-medium text-center text-lg">⚠️ Không tìm thấy mã Mentor trong URL!</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/mentors/${mentorId}`);
        const result = await response.json();

        const mentor = result.data || result; 

        if (mentor && mentor.full_name) {
            renderMentorDetail(mentor, container);
            
            fetchReviews(mentorId);
            
        } else {
            container.innerHTML = `<p class="text-slate-500 text-center text-lg">Không thể tải thông tin Mentor. Người này có thể đã bị xóa hoặc ẩn.</p>`;
        }

    } catch (error) {
        console.error("❌ Lỗi thực thi:", error);
        container.innerHTML = `<p class="text-red-500 text-center text-lg">Lỗi kết nối đến máy chủ!</p>`;
    }
}

function renderMentorDetail(mentor, container) {
    container.classList.remove('flex', 'items-center', 'justify-center');
    
    const shareUrl = window.location.href;
    const reviewCount = mentor.review_count || 0;
    const displayRating = parseFloat(mentor.avg_rating || 0).toFixed(1);

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div class="md:col-span-1 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8">
                <img src="https://mentor-web-1.onrender.com${mentor.avatar}" 
                     class="w-40 h-40 rounded-full object-cover border-4 border-slate-50 shadow-md mb-6"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=1e3a8a&color=fff&size=150'">
                
                <h1 class="text-2xl font-bold text-blue-900 font-serif mb-2">${mentor.full_name}</h1>
                <span class="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    ${mentor.expertise || 'Chuyên môn đang cập nhật'}
                </span>
                
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex items-center gap-2 text-amber-500 text-lg font-bold">
                        ⭐ ${displayRating}
                    </div>
                    <span class="text-sm text-slate-500">(${reviewCount} đánh giá)</span>
                </div>

                <button class="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm mb-5">
                    Đăng ký hướng dẫn
                </button>

                <div class="w-full text-left space-y-3">
                    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p class="text-sm text-slate-500 mb-2 font-semibold">Chia sẻ hồ sơ Mentor</p>
                        <div class="grid grid-cols-3 gap-2">
                            <button id="copyLinkBtn" class="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-100 transition">Sao chép</button>
                            <button id="shareFbBtn" class="px-3 py-2 rounded-2xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition">Facebook</button>
                            <button id="shareNativeBtn" class="px-3 py-2 rounded-2xl bg-slate-900 text-white text-sm hover:bg-slate-800 transition">Chia sẻ</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="md:col-span-2">
                <h2 class="text-xl font-bold text-slate-800 font-serif mb-4 border-b border-blue-100 pb-2">Tiểu sử & Chuyên môn</h2>
                <p class="text-slate-600 leading-relaxed whitespace-pre-line mb-8 text-justify">
                    ${mentor.bio || 'Giảng viên này chưa cập nhật tiểu sử chi tiết.'}
                </p>

                <h2 class="text-xl font-bold text-slate-800 font-serif mb-4 border-b border-blue-100 pb-2">Thông tin liên hệ</h2>
                <ul class="text-slate-600 space-y-3">
                    <li class="flex items-center gap-3">
                        <span class="text-blue-500 font-bold">✉</span> ${mentor.email || 'Đang cập nhật...'}
                    </li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('copyLinkBtn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Đã sao chép link hồ sơ mentor!');
        } catch (err) {
            console.error('Không sao chép được link:', err);
            alert('Không thể sao chép link. Vui lòng thử lại.');
        }
    });

    document.getElementById('shareFbBtn').addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    });

    document.getElementById('shareNativeBtn').addEventListener('click', async () => {
        const shareData = {
            title: `Hồ sơ Mentor ${mentor.full_name}`,
            text: `Xem hồ sơ Mentor ${mentor.full_name} trên Mentor Platform`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Web Share API lỗi:', err);
            }
        } else {
            alert('Tính năng chia sẻ không hỗ trợ trên trình duyệt này. Bạn có thể sao chép link để chia sẻ.');
        }
    });
}

// ==========================================
// PHẦN 2: XỬ LÝ ĐÁNH GIÁ (REVIEWS)
// ==========================================

async function fetchReviews(mentorId) {
    const container = document.getElementById('reviews-list');
    if (!container) return; 

    try {
        const response = await fetch(`${API_URL}/reviews/mentor/${mentorId}`);
        const result = await response.json();
        const reviews = result.data || result;

        if (Array.isArray(reviews) && reviews.length > 0) {
            renderReviews(reviews, container);
        } else {
            container.innerHTML = `
                <div class="text-center p-6 bg-slate-50 rounded-lg border border-slate-100">
                    <p class="text-slate-500 italic">Chưa có đánh giá nào cho giảng viên này. Bạn hãy là người đầu tiên nhé!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("❌ Lỗi tải đánh giá:", error);
        container.innerHTML = `<p class="text-red-500 text-sm">Không thể tải danh sách đánh giá lúc này.</p>`;
    }
}

function renderReviews(reviews, container) {
    container.innerHTML = reviews.map(review => {
        const stars = '⭐'.repeat(Math.floor(review.rating));
        const dateObj = new Date(review.created_at);
        const formattedDate = dateObj.toLocaleDateString('vi-VN');

        return `
            <div class="bg-white p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold font-serif uppercase">
                            ${review.student_name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${review.student_name}</h4>
                            <p class="text-xs text-slate-400 font-medium">${formattedDate}</p>
                        </div>
                    </div>
                    <div class="text-amber-500 text-sm tracking-widest">${stars}</div>
                </div>
                
                <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic border-l-4 border-blue-200 pl-3 ml-2">
                    "${review.comment}"
                </p>
            </div>
        `;
    }).join('');
}