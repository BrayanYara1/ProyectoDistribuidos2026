const { AppointmentStateMachine } = require('../domain/AppointmentStateMachine');
const EventPublisher = require('../events/EventPublisher');

class WorkflowEngine {
  constructor() {
    this.eventPublisher = new EventPublisher();
  }

  processTransition(appointment, targetStatus) {
    const updatedAppointment = AppointmentStateMachine.transition(appointment, targetStatus);
    this.eventPublisher.publish('AppointmentStatusChanged', {
      appointmentId: appointment.id,
      from: appointment.status,
      to: targetStatus
    });
    return updatedAppointment;
  }
}

module.exports = WorkflowEngine;
