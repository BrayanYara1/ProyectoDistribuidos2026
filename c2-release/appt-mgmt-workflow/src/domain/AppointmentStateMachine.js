const STATES = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const ALLOWED_TRANSITIONS = {
  [STATES.REQUESTED]: [STATES.CONFIRMED, STATES.CANCELLED],
  [STATES.CONFIRMED]: [STATES.IN_PROGRESS, STATES.CANCELLED],
  [STATES.IN_PROGRESS]: [STATES.COMPLETED, STATES.CANCELLED],
  [STATES.COMPLETED]: [],
  [STATES.CANCELLED]: []
};

class AppointmentStateMachine {
  static canTransition(currentStatus, nextStatus) {
    if (!STATES[currentStatus] || !STATES[nextStatus]) {
      return false;
    }
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  static transition(appointment, nextStatus) {
    if (!this.canTransition(appointment.status, nextStatus)) {
      throw new Error(`Invalid transition from ${appointment.status} to ${nextStatus}`);
    }
    return {
      ...appointment,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = { STATES, AppointmentStateMachine };
