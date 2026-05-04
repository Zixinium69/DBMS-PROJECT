const app = require('./app');
const { env } = require('./config/env');

app.listen(env.port, () => {
  console.log(`Hospital Management API running on port ${env.port}`);
});
