const express = require('express');
const router = express.Router();
const tableManagerController = require('../controllers/tableManagerController');

// إنشاء جدول جديد
router.post('/create', tableManagerController.createTable);

// جلب جميع الجداول
router.get('/tables', tableManagerController.getAllTables);

// جلب هيكل جدول
router.get('/schema/:tableName', tableManagerController.getTableSchema);

// جلب جميع البيانات من جدول
router.get('/data/:tableName', tableManagerController.getAllData);

// إدراج بيانات في جدول
router.post('/data/:tableName', tableManagerController.insertData);

// تحديث بيانات في جدول
router.put('/data/:tableName/:id', tableManagerController.updateData);

// حذف بيانات من جدول
router.delete('/data/:tableName/:id', tableManagerController.deleteData);

module.exports = router;
