const { describe, test } = require('node:test');
const assert = require('node:assert');
const { AppointmentStateMachine, STATES } = require('../src/domain/AppointmentStateMachine');
const WorkflowEngine = require('../src/services/WorkflowEngine');

describe('Workflow - State Machine TDD Tests', () => {
  test('Should allow valid transition from REQUESTED to CONFIRMED', () => {
    const appointment = { id: '101', status: STATES.REQUESTED };
    const updated = AppointmentStateMachine.transition(appointment, STATES.CONFIRMED);
    assert.strictEqual(updated.status, STATES.CONFIRMED);
  });

  test('Should reject invalid transition from REQUESTED directly to COMPLETED', () => {
    const appointment = { id: '101', status: STATES.REQUESTED };
    assert.throws(() => {
      AppointmentStateMachine.transition(appointment, STATES.COMPLETED);
    }, /Invalid transition/);
  });

  test('WorkflowEngine should process transition and publish domain event', () => {
    const engine = new WorkflowEngine();
    const appointment = { id: '102', status: STATES.CONFIRMED };
    const result = engine.processTransition(appointment, STATES.IN_PROGRESS);
    assert.strictEqual(result.status, STATES.IN_PROGRESS);
    assert.strictEqual(engine.eventPublisher.publishedEvents.length, 1);
    assert.strictEqual(engine.eventPublisher.publishedEvents[0].eventName, 'AppointmentStatusChanged');
  });
});
