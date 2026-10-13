const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Appointment Database - SQL Schema Tests', () => {
  test('init.sql must exist and contain appointments table definition', () => {
    const sqlPath = path.join(__dirname, '../init.sql');
    assert.strictEqual(fs.existsSync(sqlPath), true);
    const content = fs.readFileSync(sqlPath, 'utf8');
    assert.ok(content.includes('CREATE TABLE IF NOT EXISTS appointments'));
    assert.ok(content.includes('patient_id'));
    assert.ok(content.includes('appointment_date'));
  });

  test('seed.sql must exist with initial test data', () => {
    const seedPath = path.join(__dirname, '../seed.sql');
    assert.strictEqual(fs.existsSync(seedPath), true);
    const content = fs.readFileSync(seedPath, 'utf8');
    assert.ok(content.includes('INSERT INTO appointments'));
  });
});
