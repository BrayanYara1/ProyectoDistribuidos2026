const { describe, test } = require('node:test');
const assert = require('node:assert');
const User = require('../src/domain/User');
const JwtTokenService = require('../src/services/JwtTokenService');
const AuthenticateUserUseCase = require('../src/usecases/AuthenticateUserUseCase');

describe('IAM API - Pruebas TDD de Dominio y Autenticación', () => {
  test('Debe crear Entidad User respetando validaciones de contraseña', () => {
    const user = new User({ email: 'test@example.com', passwordHash: 'secret' });
    assert.strictEqual(user.email, 'test@example.com');
    assert.strictEqual(user.role, 'PATIENT');
  });

  test('AuthenticateUserUseCase debe retornar token JWT para credenciales válidas', () => {
    const usersMap = new Map();
    const demoUser = new User({ id: 'usr-1', email: 'medico@hospital.com', passwordHash: '123456', role: 'DOCTOR' });
    usersMap.set(demoUser.email, demoUser);
    const tokenService = new JwtTokenService();
    const useCase = new AuthenticateUserUseCase(usersMap, tokenService);

    const result = useCase.execute('medico@hospital.com', '123456');
    assert.ok(result.token);
    assert.strictEqual(result.user.email, 'medico@hospital.com');
  });

  test('AuthenticateUserUseCase debe lanzar excepción para credenciales incorrectas', () => {
    const usersMap = new Map();
    const tokenService = new JwtTokenService();
    const useCase = new AuthenticateUserUseCase(usersMap, tokenService);

    assert.throws(() => {
      useCase.execute('medico@hospital.com', 'badpassword');
    }, /Credenciales inválidas/);
  });
});
