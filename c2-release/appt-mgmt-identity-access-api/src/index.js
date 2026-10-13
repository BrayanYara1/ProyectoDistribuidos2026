const express = require('express');
const User = require('./domain/User');
const JwtTokenService = require('./services/JwtTokenService');
const AuthenticateUserUseCase = require('./usecases/AuthenticateUserUseCase');
const AuthController = require('./controllers/AuthController');

const app = express();
app.use(express.json());

const usersMap = new Map();
const demoUser = new User({ id: 'usr-1', email: 'doctor@hospital.com', passwordHash: '123456', role: 'DOCTOR', name: 'Dr. Lopez' });
usersMap.set(demoUser.email, demoUser);

const tokenService = new JwtTokenService();
const authUseCase = new AuthenticateUserUseCase(usersMap, tokenService);
const controller = new AuthController(authUseCase);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'appt-mgmt-identity-access-api' });
});

app.post('/api/v1/iam/login', (req, res) => controller.login(req, res));

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`IAM API running on port ${PORT}`);
  });
}

module.exports = app;
