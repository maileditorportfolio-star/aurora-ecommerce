const express = require('express');
const storefrontController = require('../controllers/storefront.controller');
const { PERMISSIONS } = require('../permissions');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.DESIGN_WRITE),
  storefrontController.getAdmin,
);
router.patch(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.DESIGN_WRITE),
  storefrontController.update,
);

module.exports = router;
