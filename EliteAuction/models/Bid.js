const db = require('../database/db');

class Bid {
    // تخزين مرجع db للاستخدام في الـ Controller
    static get db() {
        return db;
    }

    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS bids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                auction_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        return db.run(sql);
    }

    static create(bidData) {
        const { auction_id, user_id, amount } = bidData;
        const sql = `
            INSERT INTO bids (auction_id, user_id, amount, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `;
        return db.run(sql, [auction_id, user_id, amount]);
    }

    static findByAuctionId(auction_id) {
        const sql = `
            SELECT b.*, u.username, u.email 
            FROM bids b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.auction_id = ?
            ORDER BY b.amount DESC
        `;
        return db.all(sql, [auction_id]);
    }

    static getHighestBid(auction_id) {
        const sql = `
            SELECT * FROM bids 
            WHERE auction_id = ? 
            ORDER BY amount DESC 
            LIMIT 1
        `;
        return db.get(sql, [auction_id]);
    }

    static findByUserId(user_id) {
        const sql = `
            SELECT b.*, a.title as auction_title 
            FROM bids b
            LEFT JOIN auctions a ON b.auction_id = a.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        return db.all(sql, [user_id]);
    }
}

module.exports = Bid;
