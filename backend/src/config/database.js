const mysql = require('mysql2/promise');
const { env } = require('./env');

const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  database: env.mysql.database,
  user: env.mysql.user,
  password: env.mysql.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: env.mysql.ssl
    ? {
        rejectUnauthorized: env.mysql.rejectUnauthorized,
      }
    : undefined,
});

async function testConnection() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute('SELECT 1 AS ok');
    return rows[0];
  } finally {
    connection.release();
  }
}

async function execute(query, params = []) {
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function withConnection(callback) {
  const connection = await pool.getConnection();

  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

module.exports = { execute, pool, testConnection, withConnection };
