const { describe, test } = require('node:test');
const assert = require('node:assert');
const { AppointmentStateMachine, STATES } = require('../src/domain/AppointmentStateMachine');
const WorkflowEngine = require('../src/services/WorkflowEngine');

describe('Workflow - Pruebas TDD de la Máquina de Estados', () => {
  test('Debe permitir transición válida de SOLICITADO a CONFIRMADO', () => {
    const appointment = { id: '101', status: STATES.SOLICITADO };
    const updated = AppointmentStateMachine.transition(appointment, STATES.CONFIRMADO);
    assert.strictEqual(updated.status, STATES.CONFIRMADO);
  });

  test('Debe rechazar transición inválida de SOLICITADO a FINALIZADO directamente', () => {
    const appointment = { id: '101', status: STATES.SOLICITADO };
    assert.throws(() => {
      AppointmentStateMachine.transition(appointment, STATES.FINALIZADO);
    }, /Transición inválida/);
  });

  test('WorkflowEngine debe procesar transición y publicar evento de dominio', () => {
    const engine = new WorkflowEngine();
    const appointment = { id: '102', status: STATES.CONFIRMADO };
    const result = engine.processTransition(appointment, STATES.EN_PROCESO);
    assert.strictEqual(result.status, STATES.EN_PROCESO);
    assert.strictEqual(engine.eventPublisher.publishedEvents.length, 1);
    assert.strictEqual(engine.eventPublisher.publishedEvents[0].eventName, 'AppointmentStatusChanged');
  });
});
