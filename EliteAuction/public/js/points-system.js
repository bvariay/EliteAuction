// ============================================
// نظام النقاط والشارات - EliteAuction
// ============================================

const PointsSystem = {
    // نقاط لكل إجراء
    actions: {
        'bid': 10,
        'win_auction': 100,
        'list_item': 20,
        'daily_login': 5,
        'refer_friend': 50,
        'complete_profile': 30,
        'add_showroom': 200,
        'add_car': 25,
        'rate_seller': 15
    },

    // مستويات العضوية
    levels: {
        'bronze': 0,
        'silver': 100,
        'gold': 500,
        'platinum': 1000,
        'diamond': 5000
    },

    // شارات خاصة
    badges: {
        'first_bid': { icon: '🥇', name: 'أول مزايدة', points: 10 },
        '10_bids': { icon: '🏅', name: '10 مزايدات', points: 50 },
        '100_bids': { icon: '🎖️', name: '100 مزايدة', points: 200 },
        'first_win': { icon: '👑', name: 'أول فوز', points: 100 },
        'car_expert': { icon: '🚗', name: 'خبير سيارات', points: 150 },
        'real_estate_mogul': { icon: '🏢', name: 'قطب عقارات', points: 150 },
        'top_collector': { icon: '💎', name: 'جامع متميز', points: 300 },
        'trusted_member': { icon: '🛡️', name: 'عضو موثوق', points: 100 },
        'auction_master': { icon: '🔱', name: 'سيد المزادات', points: 500 }
    },

    // حساب النقاط
    calculatePoints: (action, count = 1) => {
        const pointsPerAction = PointsSystem.actions[action] || 0;
        return pointsPerAction * count;
    },

    // تحديد المستوى
    getLevel: (points) => {
        const levels = PointsSystem.levels;
        if (points >= levels.diamond) return { name: 'الماسي', icon: '💎', level: 'diamond' };
        if (points >= levels.platinum) return { name: 'بلاتيني', icon: '🌟', level: 'platinum' };
        if (points >= levels.gold) return { name: 'ذهبي', icon: '🥇', level: 'gold' };
        if (points >= levels.silver) return { name: 'فضي', icon: '🥈', level: 'silver' };
        return { name: 'برونزي', icon: '🥉', level: 'bronze' };
    },

    // التحقق من الشارات
    checkBadges: (user) => {
        const earned = [];
        const stats = user.stats || {};

        // أول مزايدة
        if (stats.total_bids >= 1) earned.push('first_bid');
        if (stats.total_bids >= 10) earned.push('10_bids');
        if (stats.total_bids >= 100) earned.push('100_bids');
        
        if (stats.total_wins >= 1) earned.push('first_win');
        if (stats.cars_sold >= 5) earned.push('car_expert');
        if (stats.real_estate_sold >= 3) earned.push('real_estate_mogul');
        if (stats.total_items >= 20) earned.push('top_collector');
        if (stats.rating >= 4.5) earned.push('trusted_member');
        if (stats.auctions_won >= 10) earned.push('auction_master');

        return earned.map(id => PointsSystem.badges[id]).filter(Boolean);
    },

    // عرض لوحة النقاط
    renderScoreboard: (user) => {
        const level = PointsSystem.getLevel(user.points || 0);
        const badges = PointsSystem.checkBadges(user);
        
        return `
            <div class="points-scoreboard">
                <div class="points-header">
                    <span class="points-icon">${level.icon}</span>
                    <span class="points-level">${level.name}</span>
                    <span class="points-total">${user.points || 0} نقطة</span>
                </div>
                <div class="points-progress">
                    <div class="progress-bar" style="width:${(user.points || 0) / 5000 * 100}%"></div>
                </div>
                <div class="points-badges">
                    ${badges.map(b => `
                        <span class="badge-item" title="${b.name}">
                            ${b.icon} ${b.name}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// تسجيل إجراء (يُستدعى عند كل عملية)
async function recordAction(action, userId) {
    try {
        const points = PointsSystem.calculatePoints(action);
        const response = await fetch('/api/users/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action, points })
        });
        return await response.json();
    } catch (error) {
        console.error('خطأ في تسجيل النقاط:', error);
    }
}

console.log('🏆 نظام النقاط والشارات جاهز!');
