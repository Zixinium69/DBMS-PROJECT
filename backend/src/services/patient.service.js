const { withConnection } = require('../config/database');

async function createPatient(patient) {
  return withConnection(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO patients (
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        address,
        blood_group
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient.firstName,
        patient.lastName,
        patient.dateOfBirth,
        patient.gender || null,
        patient.phone || null,
        patient.email || null,
        patient.address || null,
        patient.bloodGroup || null,
      ]
    );

    return {
      patientId: result.insertId,
      ...patient,
    };
  });
}

async function getPatients() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        patient_id AS patientId,
        first_name AS firstName,
        last_name AS lastName,
        date_of_birth AS dateOfBirth,
        gender,
        phone,
        email,
        address,
        blood_group AS bloodGroup,
        created_at AS createdAt
      FROM patients
      ORDER BY patient_id`
    );

    return rows;
  });
}

module.exports = { createPatient, getPatients };
