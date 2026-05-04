const { withConnection } = require('../config/database');

async function admitPatient(admission) {
  return withConnection(async (connection) => {
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO admissions (
          patient_id,
          doctor_id,
          room_id,
          admission_date,
          diagnosis,
          status
        ) VALUES (?, ?, ?, ?, ?, 'ADMITTED')`,
        [
          admission.patientId,
          admission.doctorId,
          admission.roomId,
          admission.admissionDate,
          admission.diagnosis || null,
        ]
      );

      await connection.execute(
        `UPDATE rooms
        SET status = 'OCCUPIED'
        WHERE room_id = ?`,
        [admission.roomId]
      );

      await connection.commit();

      return {
        admissionId: result.insertId,
        ...admission,
        status: 'ADMITTED',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function getAdmissions() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        admission_id AS admissionId,
        patient_id AS patientId,
        doctor_id AS doctorId,
        room_id AS roomId,
        admission_date AS admissionDate,
        discharge_date AS dischargeDate,
        diagnosis,
        status
      FROM admissions
      ORDER BY admission_id DESC`
    );

    return rows;
  });
}

module.exports = { admitPatient, getAdmissions };
