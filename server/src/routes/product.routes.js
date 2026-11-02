const express = require('express');
const productController = require('../controllers/product.controller');
const { PERMISSIONS } = require('../permissions');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', productController.listCategories);
router.get('/', productController.list);
router.get('/:slug', productController.detail);

router.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  productController.create,
);
router.patch(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  productController.update,
);
router.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  productController.remove,
);

module.exports = router;
