const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// تسجيل مستخدم جديد
router.post('/register', userController.register);

// تسجيل الدخول
router.post('/login', userController.login);

// جلب جميع المستخدمين
router.get('/', userController.getAllUsers);

// جلب مستخدم بالمعرف
router.get('/:id', userController.getUserById);

// تحديث مستخدم
router.put('/:id', userController.updateUser);

// حذف مستخدم
router.delete('/:id', userController.deleteUser);

module.exports = router;
