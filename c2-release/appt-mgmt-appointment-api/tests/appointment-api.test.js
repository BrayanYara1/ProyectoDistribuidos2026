const { describe, test } = require('node:test');
const assert = require('node:assert');
const Appointment = require('../src/domain/Appointment');
const AppointmentRepository = require('../src/repositories/AppointmentRepository');
const CreateAppointmentUseCase = require('../src/usecases/CreateAppointmentUseCase');

describe('Appointment API - Domain and Service TDD Tests', () => {
  test('Should instantiate Appointment entity correctly', () => {
    const appt = new Appointment({
      patientId: 'p-1',
      doctorId: 'd-1',
      specialty: 'Cardiology',
      date: '2026-04-10T10:00:00Z'
    });
    assert.strictEqual(appt.patientId, 'p-1');
    assert.strictEqual(appt.status, 'REQUESTED');
  });

  test('CreateAppointmentUseCase should save appointment in repository', () => {
    const repository = new AppointmentRepository();
    const createUseCase = new CreateAppointmentUseCase(repository);
    const created = createUseCase.execute({
      patientId: 'p-100',
      doctorId: 'd-200',
      specialty: 'Pediatrics',
      date: '2026-04-15T14:30:00Z'
    });
    assert.ok(created.id);
    assert.strictEqual(created.specialty, 'Pediatrics');
    assert.strictEqual(repository.findAll().length, 1);
  });
});
