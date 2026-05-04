const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { generateBill, viewBills } = require('../controllers/bill.controller');

const router = express.Router();

router.post('/generate', asyncHandler(generateBill));
router.get('/', asyncHandler(viewBills));

module.exports = router;
