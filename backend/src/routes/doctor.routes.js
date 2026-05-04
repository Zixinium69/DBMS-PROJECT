const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { addDoctor, viewDoctors } = require('../controllers/doctor.controller');

const router = express.Router();

router.post('/', asyncHandler(addDoctor));
router.get('/', asyncHandler(viewDoctors));

module.exports = router;
