const billService = require('../services/bill.service');

async function generateBill(req, res) {
  const patientId = Number(req.body.patientId);

  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  const bill = await billService.generateBill(patientId);
  return res.status(201).json({ message: 'Bill generated', bill });
}

async function viewBills(req, res) {
  const bills = await billService.getBills();
  return res.json({ bills });
}

module.exports = { generateBill, viewBills };
