CREATE OR REPLACE PROCEDURE create_appointment (
  p_patient_id IN appointments.patient_id%TYPE,
  p_doctor_id IN appointments.doctor_id%TYPE,
  p_appointment_date IN appointments.appointment_date%TYPE,
  p_reason IN appointments.reason%TYPE DEFAULT NULL,
  p_notes IN appointments.notes%TYPE DEFAULT NULL,
  p_appointment_id OUT appointments.appointment_id%TYPE
) AS
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
  )
  RETURNING appointment_id INTO p_appointment_id;
END;
/

CREATE OR REPLACE FUNCTION calculate_total_bill (
  p_patient_id IN patients.patient_id%TYPE
) RETURN NUMBER AS
  v_total_amount NUMBER(12,2);
BEGIN
  SELECT NVL(SUM(total_amount), 0)
  INTO v_total_amount
  FROM bills
  WHERE patient_id = p_patient_id;

  RETURN v_total_amount;
END;
/

CREATE OR REPLACE PROCEDURE generate_bill (
  p_patient_id IN patients.patient_id%TYPE
) AS
  v_admission_id bills.admission_id%TYPE;
  v_appointment_id bills.appointment_id%TYPE;
  v_consultation_charge bills.consultation_charge%TYPE;
  v_room_charge bills.room_charge%TYPE;
  v_lab_charge bills.lab_charge%TYPE;
  v_medicine_charge bills.medicine_charge%TYPE := 0;
BEGIN
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

  SELECT NVL(SUM(
    r.daily_charge * GREATEST(TRUNC(NVL(a.discharge_date, SYSDATE)) - TRUNC(a.admission_date) + 1, 1)
  ), 0)
  INTO v_room_charge
  FROM admissions a
  JOIN rooms r
    ON a.room_id = r.room_id
  WHERE a.patient_id = p_patient_id;

  SELECT NVL(SUM(cost), 0)
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
    SYSDATE,
    v_consultation_charge,
    v_room_charge,
    v_lab_charge,
    v_medicine_charge,
    v_consultation_charge + v_room_charge + v_lab_charge + v_medicine_charge,
    'UNPAID'
  );
END;
/

CREATE OR REPLACE TRIGGER trg_update_bill_after_lab_test
AFTER INSERT ON lab_tests
FOR EACH ROW
DECLARE
  v_rows_updated NUMBER;
BEGIN
  UPDATE bills
  SET lab_charge = lab_charge + NVL(:NEW.cost, 0),
      total_amount = consultation_charge
        + room_charge
        + lab_charge
        + NVL(:NEW.cost, 0)
        + medicine_charge
  WHERE patient_id = :NEW.patient_id
    AND (
      appointment_id = :NEW.appointment_id
      OR :NEW.appointment_id IS NULL
      OR appointment_id IS NULL
    );

  v_rows_updated := SQL%ROWCOUNT;

  IF v_rows_updated = 0 THEN
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
      :NEW.patient_id,
      :NEW.appointment_id,
      SYSDATE,
      0,
      0,
      NVL(:NEW.cost, 0),
      0,
      NVL(:NEW.cost, 0),
      'UNPAID'
    );
  END IF;
END;
/
