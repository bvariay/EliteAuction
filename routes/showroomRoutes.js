const express = require('express');
const router = express.Router();
const showroomController = require('../controllers/showroomController');

// جلب جميع المعارض
router.get('/', showroomController.getAllShowrooms);

// جلب جميع الماركات
router.get('/brands', showroomController.getAllBrands);

// البحث عن سيارات
router.get('/search', showroomController.searchCars);

// جلب السيارات حسب الماركة
router.get('/brand/:brand', showroomController.getCarsByBrand);

// جلب معرض مع سياراته
router.get('/:id', showroomController.getShowroomById);

// جلب سيارة من معرض
router.get('/:showroomId/car/:carId', showroomController.getShowroomCarById);

// إضافة سيارة إلى معرض
router.post('/:showroomId/cars', showroomController.addCarToShowroom);

module.exports = router;
