const db = require('../database/db');

// إضافة نقاط للمستخدم
exports.addPoints = async (req, res) => {
    try {
        const { userId, action, points } = req.body;
        
        // التحقق من وجود المستخدم
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }

        // إضافة النقاط
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + points;
        
        await db.run('UPDATE users SET points = ? WHERE id = ?', [newPoints, userId]);
        
        // تسجيل تاريخ النقاط
        await db.run(`
            INSERT INTO points_history (user_id, action, points, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `, [userId, action, points]);

        // التحقق من المستوى الجديد
        const level = getLevel(newPoints);

        res.json({
            success: true,
            points: newPoints,
            level: level,
            message: `+${points} نقطة!`
        });
    } catch (error) {
        console.error('خطأ في إضافة النقاط:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب نقاط المستخدم
exports.getUserPoints = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await db.get('SELECT id, username, points FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }

        // جلب تاريخ النقاط
        const history = await db.all(`
            SELECT * FROM points_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        `, [userId]);

        const level = getLevel(user.points || 0);

        res.json({
            success: true,
            data: {
                ...user,
                level: level,
                history: history
            }
        });
    } catch (error) {
        console.error('خطأ في جلب النقاط:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// حساب المستوى
function getLevel(points) {
    if (points >= 5000) return { name: 'الماسي', icon: '💎', level: 'diamond' };
    if (points >= 1000) return { name: 'بلاتيني', icon: '🌟', level: 'platinum' };
    if (points >= 500) return { name: 'ذهبي', icon: '🥇', level: 'gold' };
    if (points >= 100) return { name: 'فضي', icon: '🥈', level: 'silver' };
    return { name: 'برونزي', icon: '🥉', level: 'bronze' };
}

// إنشاء جدول نقاط إذا لم يكن موجوداً
async function initPointsTable() {
    try {
        // إضافة عمود points إلى users إذا لم يكن موجوداً
        await db.run(`ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0`);
    } catch (e) {
        // العمود موجود بالفعل
    }
    
    try {
        // إنشاء جدول تاريخ النقاط
        await db.run(`
            CREATE TABLE IF NOT EXISTS points_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                points INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    } catch (e) {
        console.log('جدول تاريخ النقاط موجود بالفعل');
    }
}

// تهيئة الجداول
initPointsTable();

module.exports = { addPoints: exports.addPoints, getUserPoints: exports.getUserPoints };
