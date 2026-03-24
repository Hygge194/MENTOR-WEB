
async function fetchMentors() {
    const container = document.getElementById('mentor-list');
    
    if (!container) {
        console.error("❌ Không tìm thấy thẻ có id='mentor-list' trong HTML!");
        return;
    }

    try {
        console.log("📡 Đang gọi API: " + `${API_URL}/mentors`);
        const response = await fetch(`${API_URL}/mentors`);
        const result = await response.json();

        console.log("📦 Dữ liệu thô nhận về:", result);

        const mentors = result.data; 

        if (Array.isArray(mentors) && mentors.length > 0) {
            renderMentors(mentors);
        } else {
            container.innerHTML = '<p class="text-center text-slate-500 col-span-full">Chưa có thông tin giảng viên.</p>';
        }

    } catch (error) {
        console.error("❌ Lỗi thực thi:", error);
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Lỗi kết nối đến máy chủ!</p>';
    }
}

function renderMentors(mentors) {
    const container = document.getElementById('mentor-list');
    
    container.innerHTML = mentors.map(mentor => `
        <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
            
            <div class="flex items-center gap-4 mb-4">
                <img src="http://localhost:5000${mentor.avatar}" 
                     class="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.full_name)}&background=1e3a8a&color=fff'">
                
                <div>
                    <h3 class="text-lg font-bold text-blue-900 font-serif">${mentor.full_name}</h3>
                    <span class="text-sm text-slate-500 font-medium">${mentor.expertise}</span>
                </div>
            </div>
            
            <p class="text-slate-600 text-sm mb-5 leading-relaxed flex-grow line-clamp-3">
                ${mentor.bio || 'Chưa có thông tin tiểu sử.'}
            </p>
            
            <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                <span class="text-sm font-semibold text-amber-500 flex items-center gap-1">
                    ⭐ ${parseFloat(mentor.avg_rating).toFixed(1)}
                </span>
                
                <a href="mentor-detail.html?id=${mentor.id}" 
                   class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Xem hồ sơ &rarr;
                </a>
            </div>
        </div>
    `).join('');
}

// Kích hoạt hàm
fetchMentors();