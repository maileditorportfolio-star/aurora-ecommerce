const express = require('express');
const orderController = require('../controllers/order.controller');
const { PERMISSIONS } = require('../permissions');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/admin/all',
  requireAuth,
  requirePermission(PERMISSIONS.ORDERS_READ),
  orderController.all,
);
router.get('/', requireAuth, orderController.mine);
router.post('/', requireAuth, orderController.create);
router.get('/:orderNumber', requireAuth, orderController.detail);
router.patch(
  '/:orderNumber/status',
  requireAuth,
  requirePermission(PERMISSIONS.ORDERS_WRITE),
  orderController.updateStatus,
);

module.exports = router;
