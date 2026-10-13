const express = require('express');
const authForwarder = require('./middleware/authForwarder');
const rateLimiter = require('./middleware/rateLimiter');

function createGatewayApp() {
  const app = express();
  app.use(express.json());
  app.use(authForwarder);
  app.use(rateLimiter(100, 60000));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'appt-mgmt-api-gateway' });
  });

  app.get('/api/v1/iam/status', (req, res) => {
    res.status(200).json({ status: 'IAM Gateway Route Active' });
  });

  app.get('/api/v1/appointments/status', (req, res) => {
    res.status(200).json({ status: 'Appointment Gateway Route Active' });
  });

  app.get('/api/v1/workflow/status', (req, res) => {
    res.status(200).json({ status: 'Workflow Gateway Route Active' });
  });

  return app;
}

module.exports = createGatewayApp;
