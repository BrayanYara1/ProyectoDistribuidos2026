const { describe, test } = require('node:test');
const assert = require('node:assert');
const createGatewayApp = require('../src/routes');

describe('API Gateway - Integration and Routing Tests', () => {
  const app = createGatewayApp();

  test('Gateway App must be an Express handler', () => {
    assert.ok(typeof app === 'function');
  });

  test('authForwarder middleware must set x-forwarded-auth header', () => {
    const authForwarder = require('../src/middleware/authForwarder');
    const req = { headers: { 'authorization': 'Bearer token123' } };
    const res = {};
    let nextCalled = false;
    authForwarder(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.headers['x-forwarded-auth'], 'Bearer token123');
  });

  test('Rate Limiter must allow requests within limit', () => {
    const rateLimiter = require('../src/middleware/rateLimiter');
    const middleware = rateLimiter(5, 60000);
    const req = { ip: '127.0.0.1' };
    const res = {};
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });
});
