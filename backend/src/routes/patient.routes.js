const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { addPatient, viewPatients } = require('../controllers/patient.controller');

const router = express.Router();

router.post('/', asyncHandler(addPatient));
router.get('/', asyncHandler(viewPatients));

module.exports = router;
