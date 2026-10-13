class AppointmentController {
  constructor(createAppointmentUseCase, repository) {
    this.createAppointmentUseCase = createAppointmentUseCase;
    this.repository = repository;
  }

  create(req, res) {
    try {
      const appointment = this.createAppointmentUseCase.execute(req.body);
      return res.status(201).json(appointment);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  list(req, res) {
    const list = this.repository.findAll();
    return res.status(200).json(list);
  }
}

module.exports = AppointmentController;
