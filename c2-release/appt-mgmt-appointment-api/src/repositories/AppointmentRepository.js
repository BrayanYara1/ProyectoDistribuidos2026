class AppointmentRepository {
  constructor() {
    this.appointments = new Map();
  }

  save(appointment) {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  findById(id) {
    return this.appointments.get(id) || null;
  }

  findAll() {
    return Array.from(this.appointments.values());
  }
}

module.exports = AppointmentRepository;
