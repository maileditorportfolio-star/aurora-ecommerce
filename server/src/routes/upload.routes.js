const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { upload } = require('../config/upload');
const { PERMISSIONS } = require('../permissions');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/product-image',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  upload.single('image'),
  uploadController.productImage,
);

module.exports = router;
