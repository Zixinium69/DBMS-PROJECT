const doctorService = require('../services/doctor.service');

async function addDoctor(req, res) {
  const { departmentId, firstName, lastName, specialization } = req.body;

  if (!departmentId || !firstName || !lastName || !specialization) {
    return res.status(400).json({ message: 'departmentId, firstName, lastName, and specialization are required' });
  }

  const doctor = await doctorService.createDoctor({
    ...req.body,
    departmentId: Number(departmentId),
  });

  return res.status(201).json({ message: 'Doctor added', doctor });
}

async function viewDoctors(req, res) {
  const doctors = await doctorService.getDoctors();
  return res.json({ doctors });
}

module.exports = { addDoctor, viewDoctors };
