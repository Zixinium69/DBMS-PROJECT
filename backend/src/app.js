const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hospital-management-api' });
});

app.get('/health/db', async (req, res, next) => {
  try {
    const result = await testConnection();
    res.json({ status: 'ok', database: 'mysql', result });
  } catch (error) {
    next(error);
  }
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const mysqlMessage = err.code === 'ER_NO_REFERENCED_ROW_2'
    ? 'Referenced record does not exist'
    : err.message;

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : mysqlMessage,
    error: process.env.NODE_ENV === 'production' ? undefined : mysqlMessage,
  });
});

module.exports = app;
