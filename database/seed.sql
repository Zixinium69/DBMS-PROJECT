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
) VALUES (
  'Aarav',
  'Sharma',
  DATE '1992-03-14',
  'Male',
  '9876543210',
  'aarav.sharma@example.com',
  'Mumbai',
  'B+'
);

INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group
) VALUES (
  'Ananya',
  'Verma',
  DATE '1988-09-21',
  'Female',
  '9876543211',
  'ananya.verma@example.com',
  'Delhi',
  'O+'
);

INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group
) VALUES (
  'Rohan',
  'Kapoor',
  DATE '1979-12-05',
  'Male',
  '9876543212',
  'rohan.kapoor@example.com',
  'Pune',
  'A+'
);

INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group
) VALUES (
  'Priya',
  'Nair',
  DATE '1996-06-30',
  'Female',
  '9876543213',
  'priya.nair@example.com',
  'Bengaluru',
  'AB+'
);

INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group
) VALUES (
  'Kabir',
  'Khan',
  DATE '2001-01-17',
  'Male',
  '9876543214',
  'kabir.khan@example.com',
  'Hyderabad',
  'O-'
);

INSERT INTO doctors (
  department_id,
  first_name,
  last_name,
  specialization,
  phone,
  email,
  hire_date
) VALUES (
  1,
  'Meera',
  'Iyer',
  'Cardiologist',
  '9876500001',
  'meera.iyer@example.com',
  DATE '2020-06-01'
);

INSERT INTO doctors (
  department_id,
  first_name,
  last_name,
  specialization,
  phone,
  email,
  hire_date
) VALUES (
  2,
  'Arjun',
  'Menon',
  'Orthopedic Surgeon',
  '9876500002',
  'arjun.menon@example.com',
  DATE '2019-02-15'
);

INSERT INTO doctors (
  department_id,
  first_name,
  last_name,
  specialization,
  phone,
  email,
  hire_date
) VALUES (
  1,
  'Nisha',
  'Rao',
  'Interventional Cardiologist',
  '9876500003',
  'nisha.rao@example.com',
  DATE '2021-10-10'
);

INSERT INTO rooms (
  department_id,
  room_number,
  room_type,
  bed_count,
  daily_charge,
  status
) VALUES (
  1,
  'A-201',
  'Private',
  1,
  3500,
  'OCCUPIED'
);

INSERT INTO rooms (
  department_id,
  room_number,
  room_type,
  bed_count,
  daily_charge,
  status
) VALUES (
  2,
  'B-301',
  'Semi-Private',
  2,
  2200,
  'OCCUPIED'
);

INSERT INTO rooms (
  department_id,
  room_number,
  room_type,
  bed_count,
  daily_charge,
  status
) VALUES (
  1,
  'A-202',
  'General',
  4,
  1200,
  'AVAILABLE'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES (
  1,
  1,
  SYSDATE + 1,
  'Chest pain consultation',
  'SCHEDULED',
  'Initial consultation'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES (
  2,
  2,
  SYSDATE + 2,
  'Knee pain evaluation',
  'SCHEDULED',
  'Possible ligament strain'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES (
  3,
  3,
  SYSDATE - 1,
  'Follow-up for hypertension',
  'COMPLETED',
  'Medication review completed'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES (
  4,
  1,
  SYSDATE + 3,
  'Routine cardiac screening',
  'SCHEDULED',
  'ECG requested'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  reason,
  status,
  notes
) VALUES (
  5,
  2,
  SYSDATE,
  'Shoulder injury',
  'IN_PROGRESS',
  'X-ray advised'
);

INSERT INTO admissions (
  patient_id,
  doctor_id,
  room_id,
  admission_date,
  discharge_date,
  diagnosis,
  status
) VALUES (
  1,
  1,
  1,
  SYSDATE,
  NULL,
  'Observation for cardiac symptoms',
  'ADMITTED'
);

INSERT INTO admissions (
  patient_id,
  doctor_id,
  room_id,
  admission_date,
  discharge_date,
  diagnosis,
  status
) VALUES (
  2,
  2,
  2,
  SYSDATE - 2,
  NULL,
  'Knee ligament injury',
  'ADMITTED'
);

INSERT INTO admissions (
  patient_id,
  doctor_id,
  room_id,
  admission_date,
  discharge_date,
  diagnosis,
  status
) VALUES (
  3,
  3,
  3,
  SYSDATE - 8,
  SYSDATE - 4,
  'Hypertension monitoring',
  'DISCHARGED'
);

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
  1,
  1,
  1,
  SYSDATE,
  800,
  3500,
  0,
  450,
  4750,
  'UNPAID'
);

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
  2,
  2,
  2,
  SYSDATE,
  700,
  4400,
  0,
  900,
  6000,
  'PARTIALLY_PAID'
);

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
  3,
  3,
  3,
  SYSDATE - 4,
  900,
  4800,
  0,
  1200,
  6900,
  'PAID'
);

INSERT INTO lab_tests (
  patient_id,
  doctor_id,
  appointment_id,
  test_name,
  test_date,
  result,
  status,
  cost
) VALUES (
  1,
  1,
  1,
  'Complete Blood Count',
  SYSDATE,
  NULL,
  'PENDING',
  600
);

INSERT INTO lab_tests (
  patient_id,
  doctor_id,
  appointment_id,
  test_name,
  test_date,
  result,
  status,
  cost
) VALUES (
  3,
  3,
  3,
  'Lipid Profile',
  SYSDATE - 1,
  'LDL slightly elevated',
  'COMPLETED',
  950
);

INSERT INTO lab_tests (
  patient_id,
  doctor_id,
  appointment_id,
  test_name,
  test_date,
  result,
  status,
  cost
) VALUES (
  5,
  2,
  5,
  'Shoulder X-Ray',
  SYSDATE,
  NULL,
  'PENDING',
  1200
);

COMMIT;
