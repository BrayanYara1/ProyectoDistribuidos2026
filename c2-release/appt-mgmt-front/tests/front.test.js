const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ApiClient = require('../public/js/apiClient');

describe('Frontend - Structural and API Client Tests', () => {
  test('index.html must exist and contain login form', () => {
    const indexPath = path.join(__dirname, '../public/index.html');
    assert.strictEqual(fs.existsSync(indexPath), true);
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('id="loginForm"'));
  });

  test('ApiClient must instantiate with default base URL', () => {
    const client = new ApiClient();
    assert.strictEqual(client.baseUrl, 'http://localhost:8080');
  });
});
