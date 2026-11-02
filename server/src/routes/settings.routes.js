const express = require('express');
const storefrontController = require('../controllers/storefront.controller');

const router = express.Router();

router.get('/storefront', storefrontController.getPublic);

module.exports = router;
