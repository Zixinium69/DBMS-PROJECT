const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { admitPatient, viewAdmissions } = require('../controllers/admission.controller');

const router = express.Router();

router.post('/', asyncHandler(admitPatient));
router.get('/', asyncHandler(viewAdmissions));

module.exports = router;
