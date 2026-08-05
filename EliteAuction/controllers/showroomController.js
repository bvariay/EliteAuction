const db = require('../database/db');

// ============================================
// نظام معارض السيارات
// ============================================

// جلب جميع المعارض
exports.getAllShowrooms = async (req, res) => {
    try {
        const sql = `SELECT * FROM car_showrooms WHERE status = 'active' ORDER BY rating DESC`;
        const showrooms = await db.all(sql);
        res.json({ success: true, data: showrooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب معرض واحد مع سياراته
exports.getShowroomById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // جلب معلومات المعرض
        const showroomSql = `SELECT * FROM car_showrooms WHERE id = ? AND status = 'active'`;
        const showroom = await db.get(showroomSql, [id]);
        
        if (!showroom) {
            return res.status(404).json({ success: false, message: 'المعرض غير موجود' });
        }

        // جلب سيارات المعرض
        const carsSql = `SELECT * FROM showroom_cars WHERE showroom_id = ? AND status = 'available' ORDER BY created_at DESC`;
        const cars = await db.all(carsSql, [id]);

        res.json({ success: true, data: { showroom, cars } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب سيارة من معرض
exports.getShowroomCarById = async (req, res) => {
    try {
        const { showroomId, carId } = req.params;
        const sql = `
            SELECT c.*, s.name as showroom_name, s.address as showroom_address 
            FROM showroom_cars c
            JOIN car_showrooms s ON c.showroom_id = s.id
            WHERE c.id = ? AND c.showroom_id = ? AND c.status = 'available'
        `;
        const car = await db.get(sql, [carId, showroomId]);
        
        if (!car) {
            return res.status(404).json({ success: false, message: 'السيارة غير موجودة' });
        }

        res.json({ success: true, data: car });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// البحث عن سيارات في المعارض
exports.searchCars = async (req, res) => {
    try {
        const { keyword, brand, minPrice, maxPrice, year, fuel_type, transmission } = req.query;
        
        let sql = `
            SELECT c.*, s.name as showroom_name 
            FROM showroom_cars c
            JOIN car_showrooms s ON c.showroom_id = s.id
            WHERE c.status = 'available'
        `;
        const params = [];

        if (keyword) {
            sql += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.brand LIKE ? OR c.model LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        if (brand) {
            sql += ` AND c.brand = ?`;
            params.push(brand);
        }

        if (minPrice) {
            sql += ` AND c.price >= ?`;
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            sql += ` AND c.price <= ?`;
            params.push(parseFloat(maxPrice));
        }

        if (year) {
            sql += ` AND c.year = ?`;
            params.push(parseInt(year));
        }

        if (fuel_type) {
            sql += ` AND c.fuel_type = ?`;
            params.push(fuel_type);
        }

        if (transmission) {
            sql += ` AND c.transmission = ?`;
            params.push(transmission);
        }

        sql += ` ORDER BY c.created_at DESC`;
        const cars = await db.all(sql, params);
        res.json({ success: true, data: cars, count: cars.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب السيارات حسب الماركة
exports.getCarsByBrand = async (req, res) => {
    try {
        const { brand } = req.params;
        const sql = `
            SELECT c.*, s.name as showroom_name 
            FROM showroom_cars c
            JOIN car_showrooms s ON c.showroom_id = s.id
            WHERE c.brand = ? AND c.status = 'available'
            ORDER BY c.created_at DESC
        `;
        const cars = await db.all(sql, [brand]);
        res.json({ success: true, data: cars });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب جميع الماركات المتوفرة
exports.getAllBrands = async (req, res) => {
    try {
        const sql = `SELECT DISTINCT brand FROM showroom_cars WHERE status = 'available' ORDER BY brand`;
        const brands = await db.all(sql);
        res.json({ success: true, data: brands.map(b => b.brand) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// إضافة سيارة جديدة إلى معرض
exports.addCarToShowroom = async (req, res) => {
    try {
        const { showroomId } = req.params;
        const { title, description, brand, model, year, price, currency, mileage, fuel_type, transmission, color, images } = req.body;

        if (!title || !price) {
            return res.status(400).json({ success: false, message: 'العنوان والسعر مطلوبان' });
        }

        const sql = `
            INSERT INTO showroom_cars (showroom_id, title, description, brand, model, year, price, currency, mileage, fuel_type, transmission, color, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.run(sql, [
            showroomId, title, description || '', brand || '', model || '', 
            year || null, parseFloat(price), currency || '$', 
            mileage || null, fuel_type || '', transmission || '', color || '', 
            images || ''
        ]);

        const newCar = await db.get(`SELECT * FROM showroom_cars WHERE id = ?`, [result.id]);
        res.status(201).json({ success: true, data: newCar, message: 'تم إضافة السيارة بنجاح' });
    } catch (error) {
        console.error('خطأ في إضافة السيارة:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
