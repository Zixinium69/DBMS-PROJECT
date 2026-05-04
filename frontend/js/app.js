const API_BASE_URL = 'http://localhost:5000/api';

const pageTitles = {
  dashboardPage: 'Dashboard',
  patientsPage: 'Patient Management',
  doctorsPage: 'Doctor Management',
  appointmentsPage: 'Appointment System',
  admissionsPage: 'Admissions',
  billingPage: 'Billing',
  labTestsPage: 'Lab Test Management',
};

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setMessage(id, text, isError = false) {
  const element = document.getElementById(id);
  element.textContent = text;
  element.classList.toggle('error', isError);
}

function toNumber(value) {
  return value === '' || value === undefined ? null : Number(value);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

function renderRows(tableId, rows, emptyMessage) {
  const table = document.getElementById(tableId);
  table.innerHTML = rows.length
    ? rows.join('')
    : `<tr><td colspan="8">${emptyMessage}</td></tr>`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

async function loadStats() {
  try {
    const stats = await apiRequest('/dashboard/stats');
    document.getElementById('patientCount').textContent = stats.patients;
    document.getElementById('doctorCount').textContent = stats.doctors;
    document.getElementById('appointmentCount').textContent = stats.appointments;
  } catch (error) {
    document.getElementById('patientCount').textContent = '--';
    document.getElementById('doctorCount').textContent = '--';
    document.getElementById('appointmentCount').textContent = '--';
  }
}

async function loadPatients() {
  try {
    const data = await apiRequest('/patients');
    const rows = data.patients.map((patient) => `
      <tr>
        <td>${patient.patientId}</td>
        <td>${patient.firstName} ${patient.lastName}</td>
        <td>${patient.gender || '-'}</td>
        <td>${patient.phone || '-'}</td>
        <td>${patient.bloodGroup || '-'}</td>
      </tr>
    `);
    renderRows('patientsTable', rows, 'No patients found.');
  } catch (error) {
    renderRows('patientsTable', [], 'Start the backend and Oracle database to load patient records.');
  }
}

async function loadDoctors() {
  try {
    const data = await apiRequest('/doctors');
    const rows = data.doctors.map((doctor) => `
      <tr>
        <td>${doctor.doctorId}</td>
        <td>${doctor.firstName} ${doctor.lastName}</td>
        <td>${doctor.department}</td>
        <td>${doctor.specialization}</td>
        <td>${doctor.phone || '-'}</td>
      </tr>
    `);
    renderRows('doctorsTable', rows, 'No doctors found.');
  } catch (error) {
    renderRows('doctorsTable', [], 'Start the backend and Oracle database to load doctor records.');
  }
}

async function loadAppointments() {
  try {
    const data = await apiRequest('/appointments');
    const rows = data.appointments.map((appointment) => `
      <tr>
        <td>${appointment.appointmentId}</td>
        <td>${appointment.patientName || appointment.patientId}</td>
        <td>${appointment.doctorName || appointment.doctorId}</td>
        <td>${formatDate(appointment.appointmentDate)}</td>
        <td>${appointment.status}</td>
      </tr>
    `);

    renderRows('appointmentsTable', rows, 'No appointments found.');
    renderRows('dashboardAppointmentsTable', rows.slice(0, 5), 'No upcoming appointments found.');
  } catch (error) {
    renderRows('appointmentsTable', [], 'Start the backend and Oracle database to load appointments.');
    renderRows('dashboardAppointmentsTable', [], 'Start the backend and Oracle database to load appointments.');
  }
}

async function loadAdmissions() {
  try {
    const data = await apiRequest('/admissions');
    const rows = data.admissions.map((admission) => `
      <tr>
        <td>${admission.admissionId}</td>
        <td>${admission.patientId}</td>
        <td>${admission.doctorId}</td>
        <td>${admission.roomId}</td>
        <td>${formatDate(admission.admissionDate)}</td>
        <td>${admission.status}</td>
      </tr>
    `);
    renderRows('admissionsTable', rows, 'No admissions found.');
  } catch (error) {
    renderRows('admissionsTable', [], 'Start the backend and Oracle database to load admissions.');
  }
}

async function loadBills() {
  try {
    const data = await apiRequest('/bills');
    const rows = data.bills.map((bill) => `
      <tr>
        <td>${bill.billId}</td>
        <td>${bill.patientId}</td>
        <td>${bill.consultationCharge || 0}</td>
        <td>${bill.roomCharge || 0}</td>
        <td>${bill.labCharge || 0}</td>
        <td>${bill.totalAmount || 0}</td>
        <td>${bill.paymentStatus || 'UNPAID'}</td>
      </tr>
    `);
    renderRows('billsTable', rows, 'No bills found.');
  } catch (error) {
    renderRows('billsTable', [], 'Start the backend and Oracle database to load bills.');
  }
}

async function loadLabTests() {
  try {
    const data = await apiRequest('/lab-tests');
    const rows = data.labTests.map((test) => `
      <tr>
        <td>${test.labTestId}</td>
        <td>${test.patientId}</td>
        <td>${test.testName}</td>
        <td>${formatDate(test.testDate)}</td>
        <td>${test.cost}</td>
        <td>${test.status}</td>
      </tr>
    `);
    renderRows('labTestsTable', rows, 'No lab tests found.');
  } catch (error) {
    renderRows('labTestsTable', [], 'Start the backend and Oracle database to load lab tests.');
  }
}

async function refreshAll() {
  await Promise.all([
    loadStats(),
    loadPatients(),
    loadDoctors(),
    loadAppointments(),
    loadAdmissions(),
    loadBills(),
    loadLabTests(),
  ]);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[pageId];
}

document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  refreshAll();
});

document.getElementById('logoutButton').addEventListener('click', () => {
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
});

document.querySelectorAll('.nav-link').forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.page));
});

document.getElementById('patientForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);

  try {
    await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('patientMessage', 'Patient added successfully.');
    form.reset();
    await Promise.all([loadPatients(), loadStats()]);
  } catch (error) {
    setMessage('patientMessage', error.message, true);
  }
});

document.getElementById('refreshPatientsButton').addEventListener('click', loadPatients);

document.getElementById('doctorForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);
  payload.departmentId = Number(payload.departmentId);

  try {
    await apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('doctorMessage', 'Doctor added successfully.');
    form.reset();
    await Promise.all([loadDoctors(), loadStats()]);
  } catch (error) {
    setMessage('doctorMessage', error.message, true);
  }
});

document.getElementById('appointmentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);
  payload.patientId = Number(payload.patientId);
  payload.doctorId = Number(payload.doctorId);

  try {
    await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('appointmentMessage', 'Appointment booked successfully.');
    form.reset();
    await Promise.all([loadAppointments(), loadStats()]);
  } catch (error) {
    setMessage('appointmentMessage', error.message, true);
  }
});

document.getElementById('admissionForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);
  payload.patientId = Number(payload.patientId);
  payload.doctorId = Number(payload.doctorId);
  payload.roomId = Number(payload.roomId);

  try {
    await apiRequest('/admissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('admissionMessage', 'Patient admitted successfully.');
    form.reset();
    await loadAdmissions();
  } catch (error) {
    setMessage('admissionMessage', error.message, true);
  }
});

document.getElementById('billForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);
  payload.patientId = Number(payload.patientId);

  try {
    await apiRequest('/bills/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('billMessage', 'Bill generated successfully.');
    form.reset();
    await loadBills();
  } catch (error) {
    setMessage('billMessage', error.message, true);
  }
});

document.getElementById('labTestForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = getFormData(form);
  payload.patientId = Number(payload.patientId);
  payload.doctorId = toNumber(payload.doctorId);
  payload.appointmentId = toNumber(payload.appointmentId);
  payload.cost = Number(payload.cost);

  try {
    await apiRequest('/lab-tests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setMessage('labTestMessage', 'Lab test added successfully.');
    form.reset();
    await Promise.all([loadLabTests(), loadBills()]);
  } catch (error) {
    setMessage('labTestMessage', error.message, true);
  }
});
