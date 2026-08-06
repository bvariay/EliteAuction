const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auctionController = require('../controllers/auctionController');

// إعداد رفع الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('يسمح فقط بالصور'));
    }
});

// المسارات الأساسية
router.get('/', auctionController.getAllAuctions);
router.get('/search', auctionController.advancedSearch);
router.get('/category/:category', auctionController.getAuctionsByCategory);
router.get('/active', auctionController.getActiveAuctions);
router.get('/:id', auctionController.getAuctionById);

// إضافة مزاد مع صورة
router.post('/', upload.single('image'), auctionController.createAuction);

// تحديث وحذف
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);

module.exports = router;
