const express = require('express');
const productController = require('../controllers/product.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', productController.listCategories);
router.get('/', productController.list);
router.get('/:slug', productController.detail);

router.post('/', requireAuth, requireAdmin, productController.create);
router.patch('/:id', requireAuth, requireAdmin, productController.update);
router.delete('/:id', requireAuth, requireAdmin, productController.remove);

module.exports = router;
