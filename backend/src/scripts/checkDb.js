const { pool, testConnection } = require('../config/database');

async function main() {
  const result = await testConnection();
  console.log('MySQL connection OK:', result);
}

main()
  .catch((error) => {
    console.error('MySQL connection failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });