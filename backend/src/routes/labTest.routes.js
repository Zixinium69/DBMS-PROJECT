const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { addLabTest, viewLabTests } = require('../controllers/labTest.controller');

const router = express.Router();

router.post('/', asyncHandler(addLabTest));
router.get('/', asyncHandler(viewLabTests));

module.exports = router;
