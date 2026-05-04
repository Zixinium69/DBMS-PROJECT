const { withConnection } = require('../config/database');

async function getDashboardStats() {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT
        (SELECT COUNT(*) FROM patients) AS patients,
        (SELECT COUNT(*) FROM doctors) AS doctors,
        (SELECT COUNT(*) FROM appointments) AS appointments`
    );

    return rows[0];
  });
}

module.exports = { getDashboardStats };
