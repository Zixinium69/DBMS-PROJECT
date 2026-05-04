const { withConnection } = require('../config/database');
const httpError = require('../utils/httpError');

async function callGenerateBillProcedure(connection, patientId) {
  await connection.execute('CALL generate_bill(?)', [patientId]);
}

async function getLatestBillByPatient(connection, patientId) {
  const [rows] = await connection.execute(
    `SELECT
      bill_id AS billId,
      patient_id AS patientId,
      admission_id AS admissionId,
      appointment_id AS appointmentId,
      bill_date AS billDate,
      consultation_charge AS consultationCharge,
      room_charge AS roomCharge,
      lab_charge AS labCharge,
      medicine_charge AS medicineCharge,
      total_amount AS totalAmount,
      payment_status AS paymentStatus
    FROM bills
    WHERE patient_id = ?
    ORDER BY bill_id DESC
    LIMIT 1`,
    [patientId]
  );

  return rows[0];
}

async function generateBill(patientId) {
  return withConnection(async (connection) => {
    const [patients] = await connection.execute(
      'SELECT patient_id FROM patients WHERE patient_id = ?',
      [patientId]
    );

    if (patients.length === 0) {
      throw httpError(400, 'Patient ID does not exist');
    }

    await callGenerateBillProcedure(connection, patientId);

    const bill = await getLatestBillByPatient(connection, patientId);

    if (!bill) {
      throw httpError(404, 'Bill was not generated for the provided patientId');
    }

    return bill;
  });
}

async function getBills() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        bill_id AS billId,
        patient_id AS patientId,
        admission_id AS admissionId,
        appointment_id AS appointmentId,
        bill_date AS billDate,
        consultation_charge AS consultationCharge,
        room_charge AS roomCharge,
        lab_charge AS labCharge,
        medicine_charge AS medicineCharge,
        total_amount AS totalAmount,
        payment_status AS paymentStatus
      FROM bills
      ORDER BY bill_id DESC`
    );

    return rows;
  });
}

module.exports = { callGenerateBillProcedure, generateBill, getBills, getLatestBillByPatient };
