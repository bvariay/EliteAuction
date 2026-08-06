const db = require('../database/db');

class Auction {
    // إنشاء جدول المزادات
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS auctions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                starting_price REAL NOT NULL,
                current_price REAL,
                image_url TEXT,
                seller_id INTEGER,
                status TEXT DEFAULT 'active',
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        return db.run(sql);
    }

    // إضافة مزاد جديد
    static create(auctionData) {
        const { title, description, starting_price, image_url, seller_id, end_date } = auctionData;
        const sql = `
            INSERT INTO auctions (title, description, starting_price, current_price, image_url, seller_id, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return db.run(sql, [title, description, starting_price, starting_price, image_url, seller_id, end_date]);
    }

    // جلب جميع المزادات
    static findAll() {
        const sql = `SELECT * FROM auctions ORDER BY created_at DESC`;
        return db.all(sql);
    }

    // جلب مزاد حسب المعرف
    static findById(id) {
        const sql = `SELECT * FROM auctions WHERE id = ?`;
        return db.get(sql, [id]);
    }

    // تحديث مزاد
    static update(id, data) {
        const fields = [];
        const values = [];
        
        if (data.title) { fields.push('title = ?'); values.push(data.title); }
        if (data.description) { fields.push('description = ?'); values.push(data.description); }
        if (data.current_price) { fields.push('current_price = ?'); values.push(data.current_price); }
        if (data.status) { fields.push('status = ?'); values.push(data.status); }
        
        values.push(id);
        const sql = `UPDATE auctions SET ${fields.join(', ')} WHERE id = ?`;
        return db.run(sql, values);
    }

    // حذف مزاد
    static delete(id) {
        const sql = `DELETE FROM auctions WHERE id = ?`;
        return db.run(sql, [id]);
    }

    // البحث عن مزادات
    static search(keyword) {
        const sql = `
            SELECT * FROM auctions 
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
        `;
        return db.all(sql, [`%${keyword}%`, `%${keyword}%`]);
    }
}

module.exports = Auction;
