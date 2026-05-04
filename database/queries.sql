SELECT
  a.appointment_id,
  p.patient_id,
  p.first_name || ' ' || p.last_name AS patient_name,
  d.doctor_id,
  d.first_name || ' ' || d.last_name AS doctor_name,
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
  p.first_name || ' ' || p.last_name AS patient_name,
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
  p.first_name || ' ' || p.last_name AS patient_name,
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
