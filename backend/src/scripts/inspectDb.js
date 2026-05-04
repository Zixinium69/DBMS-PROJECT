const { pool, withConnection } = require('../config/database');

async function main() {
  await withConnection(async (connection) => {
    const [tables] = await connection.execute(`
      SELECT table_name AS tableName
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `);

    console.log('Tables:', tables.map((row) => row.tableName).join(', ') || '(none)');

    const [departments] = await connection.execute('SELECT * FROM departments ORDER BY department_id');
    console.log('Departments:', departments);

    const [doctors] = await connection.execute('SELECT * FROM doctors ORDER BY doctor_id');
    console.log('Doctors:', doctors);
  });
}

main()
  .catch((error) => {
    console.error('Inspect failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
