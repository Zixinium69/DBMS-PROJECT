const { withConnection } = require('../config/database');

async function createLabTest(test) {
  return withConnection(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO lab_tests (
        patient_id,
        doctor_id,
        appointment_id,
        test_name,
        test_date,
        result,
        status,
        cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        test.patientId,
        test.doctorId || null,
        test.appointmentId || null,
        test.testName,
        test.testDate,
        test.result || null,
        test.status || 'PENDING',
        test.cost,
      ]
    );

    return {
      labTestId: result.insertId,
      ...test,
      status: test.status || 'PENDING',
    };
  });
}

async function getLabTests() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        lab_test_id AS labTestId,
        patient_id AS patientId,
        doctor_id AS doctorId,
        appointment_id AS appointmentId,
        test_name AS testName,
        test_date AS testDate,
        result,
        status,
        cost
      FROM lab_tests
      ORDER BY lab_test_id DESC`
    );

    return rows;
  });
}

module.exports = { createLabTest, getLabTests };
