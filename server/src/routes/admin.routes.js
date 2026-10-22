const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, adminController.stats);
router.get('/customers', requireAuth, requireAdmin, adminController.customers);

module.exports = router;
