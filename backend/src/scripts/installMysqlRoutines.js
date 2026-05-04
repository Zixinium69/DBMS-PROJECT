const { pool, withConnection } = require('../config/database');

async function main() {
  await withConnection(async (connection) => {
    await connection.query('DROP TRIGGER IF EXISTS trg_update_bill_after_lab_test');
    await connection.query('DROP PROCEDURE IF EXISTS generate_bill');
    await connection.query('DROP PROCEDURE IF EXISTS create_appointment');
    await connection.query('DROP FUNCTION IF EXISTS calculate_total_bill');

    await connection.query(`
      CREATE PROCEDURE create_appointment (
        IN p_patient_id INT,
        IN p_doctor_id INT,
        IN p_appointment_date DATE,
        IN p_reason VARCHAR(300),
        IN p_notes VARCHAR(500),
        OUT p_appointment_id INT
      )
      BEGIN
        INSERT INTO appointments (
          patient_id,
          doctor_id,
          appointment_date,
          reason,
          notes
        ) VALUES (
          p_patient_id,
          p_doctor_id,
          p_appointment_date,
          p_reason,
          p_notes
        );

        SET p_appointment_id = LAST_INSERT_ID();
      END
    `);

    await connection.query(`
      CREATE FUNCTION calculate_total_bill (
        p_patient_id INT
      ) RETURNS DECIMAL(12,2)
      DETERMINISTIC
      READS SQL DATA
      BEGIN
        DECLARE v_total_amount DECIMAL(12,2);

        SELECT IFNULL(SUM(total_amount), 0)
        INTO v_total_amount
        FROM bills
        WHERE patient_id = p_patient_id;

        RETURN v_total_amount;
      END
    `);

    await connection.query(`
      CREATE PROCEDURE generate_bill (
        IN p_patient_id INT
      )
      BEGIN
        DECLARE v_admission_id INT;
        DECLARE v_appointment_id INT;
        DECLARE v_consultation_charge DECIMAL(10,2);
        DECLARE v_room_charge DECIMAL(10,2);
        DECLARE v_lab_charge DECIMAL(10,2);
        DECLARE v_medicine_charge DECIMAL(10,2) DEFAULT 0;

        SELECT MAX(admission_id)
        INTO v_admission_id
        FROM admissions
        WHERE patient_id = p_patient_id;

        SELECT MAX(appointment_id)
        INTO v_appointment_id
        FROM appointments
        WHERE patient_id = p_patient_id;

        SELECT COUNT(*) * 800
        INTO v_consultation_charge
        FROM appointments
        WHERE patient_id = p_patient_id;

        SELECT IFNULL(SUM(
          r.daily_charge * GREATEST(DATEDIFF(IFNULL(a.discharge_date, CURRENT_DATE), a.admission_date) + 1, 1)
        ), 0)
        INTO v_room_charge
        FROM admissions a
        JOIN rooms r
          ON a.room_id = r.room_id
        WHERE a.patient_id = p_patient_id;

        SELECT IFNULL(SUM(cost), 0)
        INTO v_lab_charge
        FROM lab_tests
        WHERE patient_id = p_patient_id;

        INSERT INTO bills (
          patient_id,
          admission_id,
          appointment_id,
          bill_date,
          consultation_charge,
          room_charge,
          lab_charge,
          medicine_charge,
          total_amount,
          payment_status
        ) VALUES (
          p_patient_id,
          v_admission_id,
          v_appointment_id,
          CURRENT_DATE,
          v_consultation_charge,
          v_room_charge,
          v_lab_charge,
          v_medicine_charge,
          v_consultation_charge + v_room_charge + v_lab_charge + v_medicine_charge,
          'UNPAID'
        );
      END
    `);

    await connection.query(`
      CREATE TRIGGER trg_update_bill_after_lab_test
      AFTER INSERT ON lab_tests
      FOR EACH ROW
      BEGIN
        UPDATE bills
        SET lab_charge = lab_charge + IFNULL(NEW.cost, 0),
            total_amount = consultation_charge
              + room_charge
              + lab_charge
              + IFNULL(NEW.cost, 0)
              + medicine_charge
        WHERE patient_id = NEW.patient_id
          AND (
            appointment_id = NEW.appointment_id
            OR NEW.appointment_id IS NULL
            OR appointment_id IS NULL
          );

        IF ROW_COUNT() = 0 THEN
          INSERT INTO bills (
            patient_id,
            appointment_id,
            bill_date,
            consultation_charge,
            room_charge,
            lab_charge,
            medicine_charge,
            total_amount,
            payment_status
          ) VALUES (
            NEW.patient_id,
            NEW.appointment_id,
            CURRENT_DATE,
            0,
            0,
            IFNULL(NEW.cost, 0),
            0,
            IFNULL(NEW.cost, 0),
            'UNPAID'
          );
        END IF;
      END
    `);

    const [routines] = await connection.query(`
      SELECT routine_name AS routineName, routine_type AS routineType
      FROM information_schema.routines
      WHERE routine_schema = DATABASE()
      ORDER BY routine_name
    `);

    console.log('Installed routines:', routines);
    console.log('Installed trigger: trg_update_bill_after_lab_test');
  });
}

main()
  .catch((error) => {
    console.error('Routine install failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
