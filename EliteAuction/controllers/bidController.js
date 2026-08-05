const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// إضافة مزايدة
exports.createBid = async (req, res) => {
    try {
        const { auction_id, user_id, amount } = req.body;

        if (!auction_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'معرف المزاد والمبلغ مطلوبان'
            });
        }

        const auction = await Auction.findById(auction_id);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'المزاد غير موجود'
            });
        }

        const currentPrice = auction.current_price || auction.price;
        if (parseFloat(amount) <= parseFloat(currentPrice)) {
            return res.status(400).json({
                success: false,
                message: `المبلغ يجب أن يكون أكبر من السعر الحالي ($${currentPrice})`
            });
        }

        const result = await Bid.create({
            auction_id,
            user_id: user_id || 1,
            amount: parseFloat(amount)
        });

        await Auction.update(auction_id, {
            current_price: parseFloat(amount)
        });

        const newBid = await Bid.getHighestBid(auction_id);

        res.status(201).json({
            success: true,
            data: newBid,
            message: 'تم إضافة المزايدة بنجاح'
        });
    } catch (error) {
        console.error('خطأ في المزايدة:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب مزايدات مزاد معين
exports.getBidsByAuction = async (req, res) => {
    try {
        const { auction_id } = req.params;
        const sql = `
            SELECT b.*, u.username, u.email 
            FROM bids b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.auction_id = ?
            ORDER BY b.amount DESC
        `;
        const bids = await Bid.db.all(sql, [auction_id]);
        const highest = await Bid.getHighestBid(auction_id);

        res.json({
            success: true,
            data: bids,
            highest: highest || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب مزايدات مستخدم معين
exports.getBidsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const bids = await Bid.findByUserId(user_id);
        res.json({ success: true, data: bids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب أعلى مزايدة لمزاد
exports.getHighestBid = async (req, res) => {
    try {
        const { auction_id } = req.params;
        const highest = await Bid.getHighestBid(auction_id);
        res.json({ success: true, data: highest || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// جلب جميع المزايدات
exports.getAllBids = async (req, res) => {
    try {
        const sql = `
            SELECT b.*, a.title as auction_title, u.username 
            FROM bids b
            LEFT JOIN auctions a ON b.auction_id = a.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        `;
        const bids = await Bid.db.all(sql);
        res.json({ success: true, data: bids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// إضافة نقاط للمستخدم عند المزايدة
const pointsController = require('./pointsController');

// تعديل دالة createBid لإضافة نقاط
// أضف هذا السطر بعد نجاح المزايدة:
// await pointsController.addPoints({ body: { userId: user_id, action: 'bid', points: 10 } });
