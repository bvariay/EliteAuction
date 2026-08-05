const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'eliteauction.db');
const db = new DatabaseSync(dbPath);

// التحقق من وجود الجداول
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📋 الجداول الموجودة:', tables.map(t => t.name));
} catch (error) {
    console.error('❌ خطأ في فحص الجداول:', error.message);
}

const dbWrapper = {
    // تنفيذ استعلام بدون نتيجة (INSERT, UPDATE, DELETE)
    run: (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return Promise.resolve({ 
                id: result.lastInsertRowid, 
                changes: result.changes 
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },
    
    // جلب صف واحد
    get: (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.get(...params);
            return Promise.resolve(result);
        } catch (error) {
            return Promise.reject(error);
        }
    },
    
    // جلب جميع الصفوف
    all: (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.all(...params);
            return Promise.resolve(result);
        } catch (error) {
            return Promise.reject(error);
        }
    }
};

module.exports = dbWrapper;
