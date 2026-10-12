const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Infraestructura - Pruebas de Sintaxis y Configuración', () => {
  test('Debe existir el archivo docker-compose.yml y ser válido', () => {
    const composePath = path.join(__dirname, '../docker-compose.yml');
    assert.strictEqual(fs.existsSync(composePath), true);
    const content = fs.readFileSync(composePath, 'utf8');
    assert.ok(content.includes('services:'));
    assert.ok(content.includes('identity-access-api'));
    assert.ok(content.includes('appointment-api'));
    assert.ok(content.includes('api-gateway'));
  });

  test('Debe existir la configuración de Terraform AWS', () => {
    const mainTfPath = path.join(__dirname, '../terraform/main.tf');
    assert.strictEqual(fs.existsSync(mainTfPath), true);
    const content = fs.readFileSync(mainTfPath, 'utf8');
    assert.ok(content.includes('resource "aws_vpc"'));
    assert.ok(content.includes('resource "aws_ecs_cluster"'));
  });
});
