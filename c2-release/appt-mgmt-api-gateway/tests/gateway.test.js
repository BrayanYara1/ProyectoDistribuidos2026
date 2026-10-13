const { describe, test } = require('node:test');
const assert = require('node:assert');
const createGatewayApp = require('../src/routes');

describe('API Gateway - Pruebas de Integración y Enrutamiento', () => {
  const app = createGatewayApp();

  test('Gateway App debe ser un handler de Express', () => {
    assert.ok(typeof app === 'function');
  });

  test('Middleware de authForwarder debe establecer header x-forwarded-auth', () => {
    const authForwarder = require('../src/middleware/authForwarder');
    const req = { headers: { 'authorization': 'Bearer token123' } };
    const res = {};
    let nextCalled = false;
    authForwarder(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.headers['x-forwarded-auth'], 'Bearer token123');
  });

  test('Rate Limiter debe permitir peticiones dentro del límite', () => {
    const rateLimiter = require('../src/middleware/rateLimiter');
    const middleware = rateLimiter(5, 60000);
    const req = { ip: '127.0.0.1' };
    const res = {};
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });
});
