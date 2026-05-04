const appointmentService = require('../services/appointment.service');

async function createAppointment(req, res) {
  const { patientId, doctorId, appointmentDate } = req.body;

  if (!patientId || !doctorId || !appointmentDate) {
    return res.status(400).json({ message: 'patientId, doctorId, and appointmentDate are required' });
  }

  const appointment = await appointmentService.createAppointment(req.body);
  return res.status(201).json({ message: 'Appointment booked', appointment });
}

async function viewAppointments(req, res) {
  const appointments = await appointmentService.getAppointments();
  return res.json({ appointments });
}

module.exports = { createAppointment, viewAppointments };
