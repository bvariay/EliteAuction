const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');

// جلب جميع المزايدات
router.get('/', bidController.getAllBids);

// إضافة مزايدة
router.post('/', bidController.createBid);

// جلب مزايدات مزاد معين
router.get('/auction/:auction_id', bidController.getBidsByAuction);

// جلب أعلى مزايدة لمزاد
router.get('/auction/:auction_id/highest', bidController.getHighestBid);

// جلب مزايدات مستخدم معين
router.get('/user/:user_id', bidController.getBidsByUser);

module.exports = router;
