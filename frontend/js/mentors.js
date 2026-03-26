// ============================================================
//  MENTOR MODULE  —  mentors.js
//  Requires: mentors.css  (linked in HTML <head>)
//  Variables & function names UNCHANGED: fetchMentors, renderMentors
// ============================================================

async function fetchMentors() {
    const container = document.getElementById('mentor-list');

    if (!container) {
        console.error("❌ Không tìm thấy thẻ có id='mentor-list' trong HTML!");
        return;
    }

    try {
        console.log("📡 Đang gọi API: " + `${API_URL}/mentors`);

        const response = await fetch(`${API_URL}/mentors`);
        const result   = await response.json();

        console.log("📦 Dữ liệu thô từ Database nhận về:", result);

        const mentors = result.data;

        if (Array.isArray(mentors) && mentors.length > 0) {
            renderMentors(mentors);
        } else {
            container.innerHTML = `
                <div class="mc-state mc-state--empty">
                    <div class="mc-state__icon">👤</div>
                    <p class="mc-state__text">Chưa có thông tin giảng viên.</p>
                </div>`;
        }

    } catch (error) {
        console.error("❌ Lỗi thực thi:", error);
        container.innerHTML = `
            <div class="mc-state mc-state--error">
                <div class="mc-state__icon">⚠️</div>
                <p class="mc-state__text">Lỗi kết nối đến máy chủ API!</p>
            </div>`;
    }
}


/* ── renderMentors — UNCHANGED signature ────────────────── */
function renderMentors(mentors) {
    const container = document.getElementById('mentor-list');

    container.className = '';

    container.innerHTML = mentors.map((mentor, i) => `
        <div class="mc" style="animation-delay:${i * 60}ms">
            <div class="mc__band"></div>
            <div class="mc__corner"></div>

            <div class="mc__body">
                <div class="mc__head">
                    <div class="mc__avatar-wrap">
                        <img
                            src="http://localhost:5000${mentor.avatar}"
                            class="mc__avatar"
                            alt="${mentor.full_name}"
                            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=1e6fdc&color=fff&bold=true'"
                        >
                        <span class="mc__dot"></span>
                    </div>

                    <div class="mc__meta">
                        <h3 class="mc__name">${mentor.full_name}</h3>
                        <span class="mc__badge">${mentor.expertise || 'Chuyên gia'}</span>
                    </div>
                </div>

                <p class="mc__bio">
                    ${mentor.bio || 'Chưa có thông tin tiểu sử chi tiết về giảng viên này.'}
                </p>

                <div class="mc__footer">
                    <div class="mc__rating">
                        <span class="mc__star">⭐</span>
                        <span class="mc__score">${mentor.avg_rating ? parseFloat(mentor.avg_rating).toFixed(1) : '0.0'}</span>
                    </div>

                    <a href="mentor-detail.html?id=${mentor.id}" class="mc__btn">
                        Xem hồ sơ
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}


// ── Kích hoạt hàm ──────────────────────────────────────────
fetchMentors();