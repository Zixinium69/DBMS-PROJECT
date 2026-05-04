const labTestService = require('../services/labTest.service');

async function addLabTest(req, res) {
  const { patientId, testName, testDate, cost } = req.body;

  if (!patientId || !testName || !testDate || cost === undefined) {
    return res.status(400).json({ message: 'patientId, testName, testDate, and cost are required' });
  }

  const labTest = await labTestService.createLabTest({
    ...req.body,
    patientId: Number(patientId),
    doctorId: req.body.doctorId ? Number(req.body.doctorId) : null,
    appointmentId: req.body.appointmentId ? Number(req.body.appointmentId) : null,
    cost: Number(cost),
  });

  return res.status(201).json({ message: 'Lab test added', labTest });
}

async function viewLabTests(req, res) {
  const labTests = await labTestService.getLabTests();
  return res.json({ labTests });
}

module.exports = { addLabTest, viewLabTests };
