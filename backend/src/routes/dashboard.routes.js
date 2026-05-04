const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getStats } = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/stats', asyncHandler(getStats));

module.exports = router;
