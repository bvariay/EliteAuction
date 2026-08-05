const API_BASE = 'http://127.0.0.1:3000/api';

async function loadCategories() {
    console.log('🔄 جاري تحميل التصنيفات...');
    try {
        const response = await fetch(`${API_BASE}/auctions`);
        const data = await response.json();
        console.log('📊 بيانات المزادات:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            const categories = [...new Set(data.data.map(a => a.category).filter(Boolean))];
            console.log('🏷️ التصنيفات المستخرجة:', categories);
            
            if (categories.length === 0) {
                displayCategories(['سيارات', 'عقارات', 'إلكترونيات', 'مقتنيات', 'أخرى']);
            } else {
                displayCategories(categories);
            }
        } else {
            console.log('⚠️ لا توجد بيانات، استخدام تصنيفات افتراضية');
            displayCategories(['سيارات', 'عقارات', 'إلكترونيات', 'مقتنيات', 'أخرى']);
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل التصنيفات:', error);
        displayCategories(['سيارات', 'عقارات', 'إلكترونيات', 'مقتنيات', 'أخرى']);
    }
}

function displayCategories(categories) {
    console.log('🖥️ عرض التصنيفات:', categories);
    const container = document.getElementById('categories-container');
    if (!container) {
        console.warn('⚠️ عنصر categories-container غير موجود');
        return;
    }

    container.innerHTML = categories.map(cat => `
        <span class="category-badge" onclick="filterByCategory('${cat}')">
            <i class="fas fa-tag"></i> ${cat}
        </span>
    `).join('');
    console.log('✅ تم عرض التصنيفات');
}

async function filterByCategory(category) {
    console.log('🔍 تصفية حسب:', category);
    try {
        const response = await fetch(`${API_BASE}/auctions/category/${encodeURIComponent(category)}`);
        const data = await response.json();
        console.log('📊 نتائج التصفية:', data);
        if (data.success) {
            displayAuctions(data.data);
            const titleEl = document.querySelector('#auctions h3');
            if (titleEl) titleEl.innerHTML = `المزادات - ${category} <span class="badge bg-secondary" onclick="resetFilter()" style="cursor:pointer;font-size:0.7rem;">إعادة تعيين</span>`;
        }
    } catch (error) {
        console.error('❌ خطأ في التصفية:', error);
    }
}

function resetFilter() {
    console.log('🔄 إعادة تعيين التصفية');
    loadAuctions();
    const titleEl = document.querySelector('#auctions h3');
    if (titleEl) titleEl.innerHTML = 'أحدث المزادات';
}

// تحميل التصنيفات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء تحميل التصنيفات...');
    loadCategories();
});
