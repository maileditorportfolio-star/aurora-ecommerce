const express = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/all', requireAuth, requireAdmin, orderController.all);
router.get('/', requireAuth, orderController.mine);
router.post('/', requireAuth, orderController.create);
router.get('/:orderNumber', requireAuth, orderController.detail);
router.patch('/:orderNumber/status', requireAuth, requireAdmin, orderController.updateStatus);

module.exports = router;
