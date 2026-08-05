const db = require('../database/db');

// جلب جميع المزادات
exports.getAllAuctions = async (req, res) => {
    try {
        const sql = `SELECT * FROM auctions ORDER BY created_at DESC`;
        const auctions = await db.all(sql);
        res.json({ success: true, data: auctions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب مزاد واحد
exports.getAuctionById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM auctions WHERE id = ?`;
        const auction = await db.get(sql, [id]);
        if (!auction) {
            return res.status(404).json({ success: false, message: 'المزاد غير موجود' });
        }
        res.json({ success: true, data: auction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// إضافة مزاد جديد
exports.createAuction = async (req, res) => {
    try {
        const { title, description, category, price, currency } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        console.log('بيانات المزاد:', { title, description, category, price, currency });

        if (!title || !price) {
            return res.status(400).json({ success: false, message: 'العنوان والسعر مطلوبان' });
        }

        const sql = `
            INSERT INTO auctions (title, description, category, price, currency, image, created_at, current_price)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)
        `;
        const result = await db.run(sql, [
            title, 
            description || '', 
            category || 'عام', 
            parseFloat(price), 
            currency || '$', 
            image,
            parseFloat(price)
        ]);

        const newAuction = await db.get(`SELECT * FROM auctions WHERE id = ?`, [result.id]);
        res.status(201).json({ success: true, data: newAuction, message: 'تم إضافة المزاد بنجاح' });
    } catch (error) {
        console.error('خطأ في الإضافة:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// تحديث مزاد
exports.updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, price, currency, current_price } = req.body;
        
        const checkSql = `SELECT * FROM auctions WHERE id = ?`;
        const auction = await db.get(checkSql, [id]);
        if (!auction) {
            return res.status(404).json({ success: false, message: 'المزاد غير موجود' });
        }

        const fields = [];
        const values = [];
        
        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (category !== undefined) { fields.push('category = ?'); values.push(category); }
        if (price !== undefined) { fields.push('price = ?'); values.push(parseFloat(price)); }
        if (currency !== undefined) { fields.push('currency = ?'); values.push(currency); }
        if (current_price !== undefined) { fields.push('current_price = ?'); values.push(parseFloat(current_price)); }
        
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
        }
        
        values.push(id);
        const sql = `UPDATE auctions SET ${fields.join(', ')} WHERE id = ?`;
        await db.run(sql, values);

        const updated = await db.get(`SELECT * FROM auctions WHERE id = ?`, [id]);
        res.json({ success: true, data: updated, message: 'تم تحديث المزاد' });
    } catch (error) {
        console.error('خطأ في التحديث:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// حذف مزاد
exports.deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const checkSql = `SELECT * FROM auctions WHERE id = ?`;
        const auction = await db.get(checkSql, [id]);
        if (!auction) {
            return res.status(404).json({ success: false, message: 'المزاد غير موجود' });
        }

        const sql = `DELETE FROM auctions WHERE id = ?`;
        await db.run(sql, [id]);
        res.json({ success: true, message: 'تم حذف المزاد' });
    } catch (error) {
        console.error('خطأ في الحذف:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// البحث عن مزادات
exports.searchAuctions = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.json({ success: true, data: [] });
        }
        const sql = `
            SELECT * FROM auctions 
            WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
            ORDER BY created_at DESC
        `;
        const auctions = await db.all(sql, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
        res.json({ success: true, data: auctions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// البحث المتقدم عن المزادات
exports.advancedSearch = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort } = req.query;
        
        let sql = `SELECT * FROM auctions WHERE 1=1`;
        const params = [];

        if (keyword) {
            sql += ` AND (title LIKE ? OR description LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category && category !== 'الكل') {
            sql += ` AND category = ?`;
            params.push(category);
        }

        if (minPrice) {
            sql += ` AND price >= ?`;
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            sql += ` AND price <= ?`;
            params.push(parseFloat(maxPrice));
        }

        switch(sort) {
            case 'price_asc':
                sql += ` ORDER BY price ASC`;
                break;
            case 'price_desc':
                sql += ` ORDER BY price DESC`;
                break;
            case 'newest':
            default:
                sql += ` ORDER BY created_at DESC`;
                break;
        }

        const auctions = await db.all(sql, params);
        res.json({ success: true, data: auctions, count: auctions.length });
    } catch (error) {
        console.error('خطأ في البحث المتقدم:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب المزادات حسب التصنيف
exports.getAuctionsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const sql = `SELECT * FROM auctions WHERE category = ? ORDER BY created_at DESC`;
        const auctions = await db.all(sql, [category]);
        res.json({ success: true, data: auctions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب المزادات الأكثر نشاطاً
exports.getActiveAuctions = async (req, res) => {
    try {
        const sql = `SELECT * FROM auctions WHERE current_price > 0 ORDER BY current_price DESC LIMIT 10`;
        const auctions = await db.all(sql);
        res.json({ success: true, data: auctions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
