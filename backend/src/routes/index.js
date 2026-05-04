const express = require('express');
const admissionRoutes = require('./admission.routes');
const appointmentRoutes = require('./appointment.routes');
const billRoutes = require('./bill.routes');
const dashboardRoutes = require('./dashboard.routes');
const doctorRoutes = require('./doctor.routes');
const labTestRoutes = require('./labTest.routes');
const patientRoutes = require('./patient.routes');

const router = express.Router();

router.use('/admissions', admissionRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/bills', billRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/doctors', doctorRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/patients', patientRoutes);

module.exports = router;
