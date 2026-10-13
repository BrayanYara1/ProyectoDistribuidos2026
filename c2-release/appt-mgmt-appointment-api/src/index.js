const express = require('express');
const AppointmentRepository = require('./repositories/AppointmentRepository');
const CreateAppointmentUseCase = require('./usecases/CreateAppointmentUseCase');
const AppointmentController = require('./controllers/AppointmentController');

const app = express();
app.use(express.json());

const repository = new AppointmentRepository();
const createUseCase = new CreateAppointmentUseCase(repository);
const controller = new AppointmentController(createUseCase, repository);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'appt-mgmt-appointment-api' });
});

app.post('/api/v1/appointments', (req, res) => controller.create(req, res));
app.get('/api/v1/appointments', (req, res) => controller.list(req, res));

const PORT = process.env.PORT || 3002;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Appointment API corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
