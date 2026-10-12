const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ApiClient = require('../public/js/apiClient');

describe('Frontend - Pruebas Estructurales y de Cliente API', () => {
  test('Debe existir index.html con formulario de inicio de sesión', () => {
    const indexPath = path.join(__dirname, '../public/index.html');
    assert.strictEqual(fs.existsSync(indexPath), true);
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('id="loginForm"'));
  });

  test('ApiClient debe instanciarse con URL base por defecto', () => {
    const client = new ApiClient();
    assert.strictEqual(client.baseUrl, 'http://localhost:8080');
  });
});
