const { pool, withConnection } = require('../config/database');

async function main() {
  await withConnection(async (connection) => {
    await connection.execute(
      `INSERT INTO departments (department_id, department_name, location)
      VALUES
        (1, 'Cardiology', 'Block A - Floor 2'),
        (2, 'Orthopedics', 'Block B - Floor 3')
      ON DUPLICATE KEY UPDATE
        department_name = VALUES(department_name),
        location = VALUES(location)`
    );

    await connection.execute(
      `INSERT INTO rooms (room_id, department_id, room_number, room_type, bed_count, daily_charge, status)
      VALUES
        (1, 1, 'A-201', 'Private', 1, 3500, 'AVAILABLE'),
        (2, 2, 'B-301', 'Semi-Private', 2, 2200, 'AVAILABLE'),
        (3, 1, 'A-202', 'General', 4, 1200, 'AVAILABLE')
      ON DUPLICATE KEY UPDATE
        department_id = VALUES(department_id),
        room_type = VALUES(room_type),
        bed_count = VALUES(bed_count),
        daily_charge = VALUES(daily_charge),
        status = VALUES(status)`
    );

    const [departments] = await connection.execute('SELECT * FROM departments ORDER BY department_id');
    const [rooms] = await connection.execute('SELECT * FROM rooms ORDER BY room_id');

    console.log('Seeded departments:', departments);
    console.log('Seeded rooms:', rooms);
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
