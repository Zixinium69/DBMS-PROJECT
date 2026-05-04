const admissionService = require('../services/admission.service');

async function admitPatient(req, res) {
  const { patientId, doctorId, roomId, admissionDate } = req.body;

  if (!patientId || !doctorId || !roomId || !admissionDate) {
    return res.status(400).json({ message: 'patientId, doctorId, roomId, and admissionDate are required' });
  }

  const admission = await admissionService.admitPatient(req.body);
  return res.status(201).json({ message: 'Patient admitted', admission });
}

async function viewAdmissions(req, res) {
  const admissions = await admissionService.getAdmissions();
  return res.json({ admissions });
}

module.exports = { admitPatient, viewAdmissions };
