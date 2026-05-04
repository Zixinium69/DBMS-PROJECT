const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { createAppointment, viewAppointments } = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/', asyncHandler(createAppointment));
router.get('/', asyncHandler(viewAppointments));

module.exports = router;
