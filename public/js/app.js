// ============================================
// EliteAuction - التطبيق الرئيسي
// ============================================

// عنوان الخادم
const API_BASE = 'http://127.0.0.1:3000/api';

// ============================================
// جلب وعرض المزادات
// ============================================

async function loadAuctions() {
    try {
        const response = await fetch(`${API_BASE}/auctions`);
        if (!response.ok) {
            throw new Error('فشل في جلب المزادات');
        }
        const data = await response.json();
        
        if (data.success) {
            displayAuctions(data.data);
            return data.data;
        } else {
            throw new Error(data.message || 'خطأ في البيانات');
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError('تعذر الاتصال بالخادم. تأكد من تشغيل السيرفر.');
        return [];
    }
}

// عرض المزادات في الصفحة
function displayAuctions(auctions) {
    const container = document.getElementById('auctions-container');
    if (!container) return;

    if (!auctions || auctions.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h5>📭 لا توجد مزادات حالياً</h5>
                <p class="text-muted">كن أول من يضيف مزاد!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = auctions.map(auction => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="${auction.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     class="card-img-top" 
                     alt="${auction.title}"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${auction.category || 'عام'}</span>
                    <h5 class="card-title">${auction.title}</h5>
                    <p class="card-text text-muted small">${auction.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-success">$${auction.current_price || auction.price}</span>
                        <span class="text-muted small">${auction.currency || '$'}</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="/auction.html?id=${auction.id}" class="btn btn-outline-primary btn-sm w-100">تفاصيل</a>
                </div>
            </div>
        </div>
    `).join('');
}

// عرض خطأ
function showError(message) {
    const container = document.getElementById('auctions-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <h5>⚠️ ${message}</h5>
                    <p class="mb-0">تأكد من تشغيل السيرفر: <code>npm start</code></p>
                </div>
            </div>
        `;
    }
    // عرض في console
    console.error('❌', message);
}

// ============================================
// إضافة مزاد جديد
// ============================================

async function addAuction(formData) {
    try {
        const response = await fetch(`${API_BASE}/auctions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            alert('✅ تم إضافة المزاد بنجاح!');
            window.location.href = '/';
            return data.data;
        } else {
            alert('❌ خطأ: ' + data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ خطأ في الإضافة:', error);
        alert('❌ تعذر الاتصال بالخادم');
        return null;
    }
}

// ============================================
// جلب تفاصيل مزاد محدد
// ============================================

async function getAuction(id) {
    try {
        const response = await fetch(`${API_BASE}/auctions/${id}`);
        if (!response.ok) {
            throw new Error('فشل في جلب تفاصيل المزاد');
        }
        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError('تعذر جلب تفاصيل المزاد');
        return null;
    }
}

// ============================================
// تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // تحميل المزادات في الصفحة الرئيسية
    if (document.getElementById('auctions-container')) {
        loadAuctions();
    }

    // التعامل مع نموذج إضافة المزاد
    const form = document.getElementById('add-auction-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                price: parseFloat(document.getElementById('price').value),
                currency: document.getElementById('currency').value || '$'
            };
            await addAuction(formData);
        });
    }

    // تحميل تفاصيل المزاد في صفحة التفاصيل
    if (document.getElementById('auction-details')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            loadAuctionDetails(id);
        }
    }
});

// تحميل تفاصيل المزاد
async function loadAuctionDetails(id) {
    const container = document.getElementById('auction-details');
    if (!container) return;

    try {
        const auction = await getAuction(id);
        if (!auction) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <h5>⚠️ المزاد غير موجود</h5>
                    <a href="/" class="btn btn-primary">العودة للرئيسية</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${auction.image || 'https://via.placeholder.com/600x400?text=No+Image'}" 
                         class="img-fluid rounded" 
                         alt="${auction.title}">
                </div>
                <div class="col-md-6">
                    <h2>${auction.title}</h2>
                    <p class="text-muted">${auction.description || 'لا يوجد وصف'}</p>
                    <div class="mb-3">
                        <span class="badge bg-primary">${auction.category || 'عام'}</span>
                        <span class="badge bg-success">$${auction.current_price || auction.price}</span>
                    </div>
                    <p><strong>السعر الحالي:</strong> $${auction.current_price || auction.price}</p>
                    <p><strong>تاريخ الإضافة:</strong> ${new Date(auction.created_at).toLocaleDateString('ar')}</p>
                    <a href="/" class="btn btn-secondary">العودة للرئيسية</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ خطأ:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <h5>⚠️ تعذر تحميل تفاصيل المزاد</h5>
                <a href="/" class="btn btn-primary">العودة للرئيسية</a>
            </div>
        `;
    }
}

// دالة للبحث
async function searchAuctions(keyword) {
    try {
        const response = await fetch(`${API_BASE}/auctions/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        if (data.success) {
            displayAuctions(data.data);
        }
    } catch (error) {
        console.error('❌ خطأ في البحث:', error);
    }
}

console.log('🚀 EliteAuction App Loaded');
console.log(`📡 API Base: ${API_BASE}`);

// ============================================
// نظام النقاط - عرض في الواجهة
// ============================================

async function loadUserPoints(userId) {
    try {
        const response = await fetch(`/api/points/user/${userId}`);
        const data = await response.json();
        if (data.success) {
            updatePointsUI(data.data);
            return data.data;
        }
    } catch (error) {
        console.error('خطأ في تحميل النقاط:', error);
    }
}

function updatePointsUI(userData) {
    const board = document.getElementById('points-board');
    if (!board) return;
    
    board.style.display = 'block';
    document.getElementById('points-level-icon').textContent = userData.level.icon;
    document.getElementById('points-level-name').textContent = userData.level.name;
    document.getElementById('points-total').textContent = userData.points || 0;
    
    // شريط التقدم
    const progress = Math.min((userData.points || 0) / 5000 * 100, 100);
    document.getElementById('points-progress').style.width = progress + '%';
    
    // الشارات (إذا كانت متوفرة)
    const badgesContainer = document.getElementById('points-badges');
    if (badgesContainer && userData.badges) {
        badgesContainer.innerHTML = userData.badges.map(b => `
            <span class="badge-item" style="background:rgba(108,60,225,0.2);padding:4px 12px;border-radius:50px;font-size:0.8rem;">
                ${b.icon} ${b.name}
            </span>
        `).join('');
    }
}
