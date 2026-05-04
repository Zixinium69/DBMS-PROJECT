USE defaultdb;

DROP TRIGGER IF EXISTS trg_update_bill_after_lab_test;
DROP PROCEDURE IF EXISTS generate_bill;
DROP PROCEDURE IF EXISTS create_appointment;
DROP FUNCTION IF EXISTS calculate_total_bill;

DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS lab_tests;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  department_id INT AUTO_INCREMENT,
  department_name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_departments PRIMARY KEY (department_id),
  CONSTRAINT uq_departments_name UNIQUE (department_name)
);

CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(150),
  address VARCHAR(300),
  blood_group VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_patients PRIMARY KEY (patient_id)
);

CREATE TABLE doctors (
  doctor_id INT AUTO_INCREMENT,
  department_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_doctors PRIMARY KEY (doctor_id),
  CONSTRAINT fk_doctors_department FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
);

CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT,
  department_id INT,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(50),
  bed_count INT DEFAULT 1 NOT NULL,
  daily_charge DECIMAL(10,2) DEFAULT 0 NOT NULL,
  status VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_rooms PRIMARY KEY (room_id),
  CONSTRAINT uq_rooms_number UNIQUE (room_number),
  CONSTRAINT fk_rooms_department FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
);

CREATE TABLE appointments (
  appointment_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  reason VARCHAR(300),
  status VARCHAR(30) DEFAULT 'SCHEDULED' NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_appointments PRIMARY KEY (appointment_id),
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id),
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(doctor_id)
);

CREATE TABLE admissions (
  admission_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  room_id INT NOT NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE,
  diagnosis VARCHAR(500),
  status VARCHAR(30) DEFAULT 'ADMITTED' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_admissions PRIMARY KEY (admission_id),
  CONSTRAINT fk_admissions_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id),
  CONSTRAINT fk_admissions_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(doctor_id),
  CONSTRAINT fk_admissions_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id)
);

CREATE TABLE lab_tests (
  lab_test_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT,
  appointment_id INT,
  test_name VARCHAR(150) NOT NULL,
  test_date DATE DEFAULT (CURRENT_DATE) NOT NULL,
  result VARCHAR(1000),
  status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_lab_tests PRIMARY KEY (lab_test_id),
  CONSTRAINT fk_lab_tests_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id),
  CONSTRAINT fk_lab_tests_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(doctor_id),
  CONSTRAINT fk_lab_tests_appointment FOREIGN KEY (appointment_id)
    REFERENCES appointments(appointment_id)
);

CREATE TABLE bills (
  bill_id INT AUTO_INCREMENT,
  patient_id INT NOT NULL,
  admission_id INT,
  appointment_id INT,
  bill_date DATE DEFAULT (CURRENT_DATE) NOT NULL,
  consultation_charge DECIMAL(10,2) DEFAULT 0 NOT NULL,
  room_charge DECIMAL(10,2) DEFAULT 0 NOT NULL,
  lab_charge DECIMAL(10,2) DEFAULT 0 NOT NULL,
  medicine_charge DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'UNPAID' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT pk_bills PRIMARY KEY (bill_id),
  CONSTRAINT fk_bills_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id),
  CONSTRAINT fk_bills_admission FOREIGN KEY (admission_id)
    REFERENCES admissions(admission_id),
  CONSTRAINT fk_bills_appointment FOREIGN KEY (appointment_id)
    REFERENCES appointments(appointment_id)
);

CREATE INDEX idx_doctors_department ON doctors(department_id);
CREATE INDEX idx_rooms_department ON rooms(department_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_room ON admissions(room_id);
CREATE INDEX idx_lab_tests_patient ON lab_tests(patient_id);
CREATE INDEX idx_bills_patient ON bills(patient_id);

DELIMITER //

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
END//

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
END//

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
END//

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
END//

DELIMITER ;

INSERT INTO departments (department_name, location)
VALUES ('Cardiology', 'Block A - Floor 2');

INSERT INTO departments (department_name, location)
VALUES ('Orthopedics', 'Block B - Floor 3');

INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group
) VALUES
('Aarav', 'Sharma', '1992-03-14', 'Male', '9876543210', 'aarav.sharma@example.com', 'Mumbai', 'B+'),
('Ananya', 'Verma', '1988-09-21', 'Female', '9876543211', 'ananya.verma@example.com', 'Delhi', 'O+'),
('Rohan', 'Kapoor', '1979-12-05', 'Male', '9876543212', 'rohan.kapoor@example.com', 'Pune', 'A+'),
('Priya', 'Nair', '1996-06-30', 'Female', '9876543213', 'priya.nair@example.com', 'Bengaluru', 'AB+'),
('Kabir', 'Khan', '2001-01-17', 'Male', '9876543214', 'kabir.khan@example.com', 'Hyderabad', 'O-');

INSERT INTO doctors (
  department_id,
  first_name,
  last_name,
  specialization,
  phone,
  email,
  hire_date
) VALUES
(1, 'Meera', 'Iyer', 'Cardiologist', '9876500001', 'meera.iyer@example.com', '2020-06-01'),
(2, 'Arjun', 'Menon', 'Orthopedic Surgeon', '9876500002', 'arjun.menon@example.com', '2019-02-15'),
(1, 'Nisha', 'Rao', 'Interventional Cardiologist', '9876500003', 'nisha.rao@example.com', '2021-10-10');

INSERT INTO rooms (
  department_id,
  room_number,
  room_type,
  bed_count,
  daily_charge,
  status
) VALUES
(1, 'A-201', 'Private', 1, 3500, 'OCCUPIED'),
(2, 'B-301', 'Semi-Private', 2, 2200, 'OCCUPIED'),
(1, 'A-202', 'General', 4, 1200, 'AVAILABLE');

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES
(1, 1, CURRENT_DATE + INTERVAL 1 DAY, 'Chest pain consultation', 'SCHEDULED', 'Initial consultation'),
(2, 2, CURRENT_DATE + INTERVAL 2 DAY, 'Knee pain evaluation', 'SCHEDULED', 'Possible ligament strain'),
(3, 3, CURRENT_DATE - INTERVAL 1 DAY, 'Follow-up for hypertension', 'COMPLETED', 'Medication review completed'),
(4, 1, CURRENT_DATE + INTERVAL 3 DAY, 'Routine cardiac screening', 'SCHEDULED', 'ECG requested'),
(5, 2, CURRENT_DATE, 'Shoulder injury', 'IN_PROGRESS', 'X-ray advised');

INSERT INTO admissions (
  patient_id,
  doctor_id,
  room_id,
  admission_date,
  discharge_date,
  diagnosis,
  status
) VALUES
(1, 1, 1, CURRENT_DATE, NULL, 'Observation for cardiac symptoms', 'ADMITTED'),
(2, 2, 2, CURRENT_DATE - INTERVAL 2 DAY, NULL, 'Knee ligament injury', 'ADMITTED'),
(3, 3, 3, CURRENT_DATE - INTERVAL 8 DAY, CURRENT_DATE - INTERVAL 4 DAY, 'Hypertension monitoring', 'DISCHARGED');

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
) VALUES
(1, 1, 1, CURRENT_DATE, 800, 3500, 0, 450, 4750, 'UNPAID'),
(2, 2, 2, CURRENT_DATE, 700, 4400, 0, 900, 6000, 'PARTIALLY_PAID'),
(3, 3, 3, CURRENT_DATE - INTERVAL 4 DAY, 900, 4800, 0, 1200, 6900, 'PAID');

INSERT INTO lab_tests (
  patient_id,
  doctor_id,
  appointment_id,
  test_name,
  test_date,
  result,
  status,
  cost
) VALUES
(1, 1, 1, 'Complete Blood Count', CURRENT_DATE, NULL, 'PENDING', 600),
(3, 3, 3, 'Lipid Profile', CURRENT_DATE - INTERVAL 1 DAY, 'LDL slightly elevated', 'COMPLETED', 950),
(5, 2, 5, 'Shoulder X-Ray', CURRENT_DATE, NULL, 'PENDING', 1200);

SELECT
  a.appointment_id,
  p.patient_id,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  d.doctor_id,
  CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
  dept.department_name,
  a.appointment_date,
  a.reason,
  a.status
FROM appointments a
JOIN patients p
  ON a.patient_id = p.patient_id
JOIN doctors d
  ON a.doctor_id = d.doctor_id
JOIN departments dept
  ON d.department_id = dept.department_id
ORDER BY a.appointment_date;

SELECT
  p.patient_id,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  SUM(b.total_amount) AS total_billing
FROM patients p
JOIN bills b
  ON p.patient_id = b.patient_id
GROUP BY
  p.patient_id,
  p.first_name,
  p.last_name
ORDER BY total_billing DESC;

SELECT
  p.patient_id,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  b.bill_id,
  b.total_amount,
  b.payment_status
FROM patients p
JOIN bills b
  ON p.patient_id = b.patient_id
WHERE b.total_amount = (
  SELECT MAX(total_amount)
  FROM bills
);
