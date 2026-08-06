const db = require('../database/db');
const crypto = require('crypto');

class User {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT,
                phone TEXT,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `;
        return db.run(sql);
    }

    static hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    static create(userData) {
        const { username, email, password, full_name, phone, role } = userData;
        const hashedPassword = this.hashPassword(password);
        const sql = `
            INSERT INTO users (username, email, password, full_name, phone, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return db.run(sql, [
            username || email.split('@')[0], 
            email, 
            hashedPassword, 
            full_name || '', 
            phone || '', 
            role || 'user'
        ]);
    }

    static findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        return db.get(sql, [email]);
    }

    static findByUsername(username) {
        const sql = `SELECT * FROM users WHERE username = ?`;
        return db.get(sql, [username]);
    }

    static findById(id) {
        const sql = `SELECT id, username, email, full_name, phone, role, created_at, last_login FROM users WHERE id = ?`;
        return db.get(sql, [id]);
    }

    static verifyPassword(user, password) {
        return user.password === this.hashPassword(password);
    }

    static updateLastLogin(id) {
        const sql = `UPDATE users SET last_login = datetime('now') WHERE id = ?`;
        return db.run(sql, [id]);
    }

    static update(id, data) {
        const fields = [];
        const values = [];
        
        if (data.full_name !== undefined) { fields.push('full_name = ?'); values.push(data.full_name); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.username !== undefined) { fields.push('username = ?'); values.push(data.username); }
        if (data.password) { 
            fields.push('password = ?'); 
            values.push(this.hashPassword(data.password)); 
        }
        if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
        
        if (fields.length === 0) return Promise.resolve({ changes: 0 });
        
        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        return db.run(sql, values);
    }

    static delete(id) {
        const sql = `DELETE FROM users WHERE id = ?`;
        return db.run(sql, [id]);
    }

    static findAll() {
        const sql = `SELECT id, username, email, full_name, phone, role, created_at, last_login FROM users ORDER BY created_at DESC`;
        return db.all(sql);
    }
}

module.exports = User;
