const Appointment = require('../domain/Appointment');

class CreateAppointmentUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  execute(data) {
    const appointment = new Appointment(data);
    return this.repository.save(appointment);
  }
}

module.exports = CreateAppointmentUseCase;
