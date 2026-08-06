const db = require('../database/db');

// ============================================
// نظام إدارة الجداول الديناميكي
// ============================================

// إنشاء جدول جديد
exports.createTable = async (req, res) => {
    try {
        const { tableName, columns } = req.body;
        
        if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'اسم الجدول والأعمدة مطلوبة'
            });
        }

        // بناء استعلام CREATE TABLE
        const columnDefs = columns.map(col => {
            let def = `${col.name} ${col.type}`;
            if (col.primaryKey) def += ' PRIMARY KEY';
            if (col.autoIncrement) def += ' AUTOINCREMENT';
            if (col.notNull) def += ' NOT NULL';
            if (col.unique) def += ' UNIQUE';
            if (col.default !== undefined) def += ` DEFAULT '${col.default}'`;
            return def;
        });

        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs.join(', ')})`;
        await db.run(sql);

        // إنشاء مجلد للواجهات الخاصة بالجدول
        const viewsDir = `${__dirname}/../public/dynamic/${tableName}`;
        const fs = require('fs');
        if (!fs.existsSync(viewsDir)) {
            fs.mkdirSync(viewsDir, { recursive: true });
        }

        res.json({
            success: true,
            message: `تم إنشاء الجدول ${tableName} بنجاح`,
            table: tableName,
            columns: columns
        });
    } catch (error) {
        console.error('خطأ في إنشاء الجدول:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب هيكل الجدول
exports.getTableSchema = async (req, res) => {
    try {
        const { tableName } = req.params;
        const sql = `PRAGMA table_info(${tableName})`;
        const schema = await db.all(sql);
        res.json({ success: true, data: schema });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب جميع الجداول
exports.getAllTables = async (req, res) => {
    try {
        const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
        const tables = await db.all(sql);
        res.json({ success: true, data: tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// إدراج بيانات في جدول
exports.insertData = async (req, res) => {
    try {
        const { tableName } = req.params;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'البيانات مطلوبة'
            });
        }

        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await db.run(sql, values);

        res.json({
            success: true,
            message: 'تم إضافة البيانات بنجاح',
            id: result.id
        });
    } catch (error) {
        console.error('خطأ في الإدراج:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب جميع البيانات من جدول
exports.getAllData = async (req, res) => {
    try {
        const { tableName } = req.params;
        const sql = `SELECT * FROM ${tableName}`;
        const data = await db.all(sql);
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// تحديث بيانات في جدول
exports.updateData = async (req, res) => {
    try {
        const { tableName, id } = req.params;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'البيانات مطلوبة'
            });
        }

        const columns = Object.keys(data);
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        await db.run(sql, values);

        res.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح'
        });
    } catch (error) {
        console.error('خطأ في التحديث:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// حذف بيانات من جدول
exports.deleteData = async (req, res) => {
    try {
        const { tableName, id } = req.params;
        const sql = `DELETE FROM ${tableName} WHERE id = ?`;
        await db.run(sql, [id]);
        res.json({
            success: true,
            message: 'تم حذف البيانات بنجاح'
        });
    } catch (error) {
        console.error('خطأ في الحذف:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
