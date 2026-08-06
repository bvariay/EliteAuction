const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');

// إضافة نقاط
router.post('/add', pointsController.addPoints);

// جلب نقاط المستخدم
router.get('/user/:userId', pointsController.getUserPoints);

module.exports = router;
