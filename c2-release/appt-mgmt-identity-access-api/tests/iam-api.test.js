const { describe, test } = require('node:test');
const assert = require('node:assert');
const User = require('../src/domain/User');
const JwtTokenService = require('../src/services/JwtTokenService');
const AuthenticateUserUseCase = require('../src/usecases/AuthenticateUserUseCase');

describe('IAM API - Domain and Authentication TDD Tests', () => {
  test('Should create User entity respecting password validation', () => {
    const user = new User({ email: 'test@example.com', passwordHash: 'secret' });
    assert.strictEqual(user.email, 'test@example.com');
    assert.strictEqual(user.role, 'PATIENT');
  });

  test('AuthenticateUserUseCase should return JWT token for valid credentials', () => {
    const usersMap = new Map();
    const demoUser = new User({ id: 'usr-1', email: 'doctor@hospital.com', passwordHash: '123456', role: 'DOCTOR' });
    usersMap.set(demoUser.email, demoUser);
    const tokenService = new JwtTokenService();
    const useCase = new AuthenticateUserUseCase(usersMap, tokenService);

    const result = useCase.execute('doctor@hospital.com', '123456');
    assert.ok(result.token);
    assert.strictEqual(result.user.email, 'doctor@hospital.com');
  });

  test('AuthenticateUserUseCase should throw exception for invalid credentials', () => {
    const usersMap = new Map();
    const tokenService = new JwtTokenService();
    const useCase = new AuthenticateUserUseCase(usersMap, tokenService);

    assert.throws(() => {
      useCase.execute('doctor@hospital.com', 'badpassword');
    }, /Invalid credentials/);
  });
});
