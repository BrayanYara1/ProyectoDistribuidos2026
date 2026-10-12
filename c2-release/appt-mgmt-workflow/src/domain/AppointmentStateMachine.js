const STATES = {
  SOLICITADO: 'SOLICITADO',
  CONFIRMADO: 'CONFIRMADO',
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO'
};

const ALLOWED_TRANSITIONS = {
  [STATES.SOLICITADO]: [STATES.CONFIRMADO, STATES.CANCELADO],
  [STATES.CONFIRMADO]: [STATES.EN_PROCESO, STATES.CANCELADO],
  [STATES.EN_PROCESO]: [STATES.FINALIZADO, STATES.CANCELADO],
  [STATES.FINALIZADO]: [],
  [STATES.CANCELADO]: []
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
      throw new Error(`Transición inválida de ${appointment.status} a ${nextStatus}`);
    }
    return {
      ...appointment,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = { STATES, AppointmentStateMachine };
