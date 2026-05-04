const { withConnection } = require('../config/database');
const httpError = require('../utils/httpError');

async function createDoctor(doctor) {
  return withConnection(async (connection) => {
    const [departments] = await connection.execute(
      'SELECT department_id FROM departments WHERE department_id = ?',
      [doctor.departmentId]
    );

    if (departments.length === 0) {
      throw httpError(400, 'Department ID does not exist');
    }

    const [result] = await connection.execute(
      `INSERT INTO doctors (
        department_id,
        first_name,
        last_name,
        specialization,
        phone,
        email,
        hire_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        doctor.departmentId,
        doctor.firstName,
        doctor.lastName,
        doctor.specialization,
        doctor.phone || null,
        doctor.email || null,
        doctor.hireDate || null,
      ]
    );

    return {
      doctorId: result.insertId,
      ...doctor,
    };
  });
}

async function getDoctors() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        d.doctor_id AS doctorId,
        d.department_id AS departmentId,
        dept.department_name AS department,
        d.first_name AS firstName,
        d.last_name AS lastName,
        d.specialization,
        d.phone,
        d.email,
        d.hire_date AS hireDate
      FROM doctors d
      JOIN departments dept
        ON d.department_id = dept.department_id
      ORDER BY d.doctor_id`
    );

    return rows;
  });
}

module.exports = { createDoctor, getDoctors };
