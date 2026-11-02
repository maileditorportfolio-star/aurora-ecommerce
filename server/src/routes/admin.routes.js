const express = require('express');
const adminController = require('../controllers/admin.controller');
const { PERMISSIONS } = require('../permissions');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/stats',
  requireAuth,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  adminController.stats,
);
router.get(
  '/customers',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_READ),
  adminController.customers,
);

module.exports = router;
