const { withConnection } = require('../config/database');

async function createAppointment(appointment) {
  return withConnection(async (connection) => {
    await connection.execute(
      `CALL create_appointment(?, ?, ?, ?, ?, @appointment_id)`,
      [
        appointment.patientId,
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.reason || null,
        appointment.notes || null,
      ]
    );

    const [[outParam]] = await connection.execute('SELECT @appointment_id AS appointmentId');

    return {
      appointmentId: outParam.appointmentId,
      ...appointment,
      status: 'SCHEDULED',
    };
  });
}

async function getAppointments() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        a.appointment_id AS appointmentId,
        a.patient_id AS patientId,
        CONCAT(p.first_name, ' ', p.last_name) AS patientName,
        a.doctor_id AS doctorId,
        CONCAT(d.first_name, ' ', d.last_name) AS doctorName,
        a.appointment_date AS appointmentDate,
        a.reason,
        a.status,
        a.notes
      FROM appointments a
      JOIN patients p
        ON a.patient_id = p.patient_id
      JOIN doctors d
        ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date DESC`
    );

    return rows;
  });
}

module.exports = { createAppointment, getAppointments };
