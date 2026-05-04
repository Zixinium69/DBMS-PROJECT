const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const env = {
  port: process.env.PORT || 5000,
  mysql: {
    host: required('MYSQL_HOST'),
    port: Number(process.env.MYSQL_PORT || 3306),
    database: required('MYSQL_DATABASE'),
    user: required('MYSQL_USER'),
    password: required('MYSQL_PASSWORD'),
    ssl: process.env.MYSQL_SSL === 'true',
    rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
};

module.exports = { env };