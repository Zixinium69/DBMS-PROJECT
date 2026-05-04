const patientService = require('../services/patient.service');

async function addPatient(req, res) {
  const { firstName, lastName, dateOfBirth } = req.body;

  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({ message: 'firstName, lastName, and dateOfBirth are required' });
  }

  const patient = await patientService.createPatient(req.body);
  return res.status(201).json({ message: 'Patient added', patient });
}

async function viewPatients(req, res) {
  const patients = await patientService.getPatients();
  return res.json({ patients });
}

module.exports = { addPatient, viewPatients };
