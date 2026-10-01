jest.mock('../middleware/notification', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Turno = require('../models/Turno');
const { sendPushNotification } = require('../middleware/notification');

describe('GET /api/status', () => {
  it('debería responder con estado 200 y el estado del servidor', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('online');
  });

  it('debería responder 404 para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');
    expect(res.statusCode).toEqual(404);
  });
});

describe('Rutas autenticadas de turnos', () => {
  const userId = '507f1f77bcf86cd799439011';
  const secret = process.env.JWT_SECRET || 'SaludActiva_Secret_Key_2024';
  const token = jwt.sign({ userId }, secret);
  const date = '2026-10-01';
  const time = '10:30';

  beforeEach(() => {
    jest.spyOn(User, 'findById').mockResolvedValue({ _id: userId });
    sendPushNotification.mockReset();
    sendPushNotification.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería responder 400 si falta la fecha o la hora', async () => {
    const findOne = jest.spyOn(Turno, 'findOne');
    const missingDate = await request(app)
      .get(`/api/turnos/check-availability?hora=${time}`)
      .set('Authorization', `Bearer ${token}`);
    const missingTime = await request(app)
      .get(`/api/turnos/check-availability?fecha=${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(missingDate.statusCode).toBe(400);
    expect(missingTime.statusCode).toBe(400);
    expect(missingDate.body).toHaveProperty('mensaje');
    expect(missingTime.body).toHaveProperty('mensaje');
    expect(findOne).not.toHaveBeenCalled();
  });

  it('debería indicar disponible cuando no existe un turno activo', async () => {
    const findOne = jest.spyOn(Turno, 'findOne').mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/turnos/check-availability?fecha=${date}&hora=${time}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ disponible: true });
    expect(findOne).toHaveBeenCalledWith({
      fecha: date,
      hora: time,
      estado: { $nin: ['Cancelado', 'cancelled', 'CANCELADO'] },
    });
  });

  it('debería responder 500 si falla la consulta de disponibilidad', async () => {
    jest.spyOn(Turno, 'findOne').mockRejectedValue(new Error('database unavailable'));

    const response = await request(app)
      .get(`/api/turnos/check-availability?fecha=${date}&hora=${time}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.mensaje).toBe('Error al verificar disponibilidad');
  });

  it('debería indicar no disponible cuando existe un turno activo', async () => {
    jest.spyOn(Turno, 'findOne').mockResolvedValue({ _id: 'turno-ocupado' });

    const response = await request(app)
      .get(`/api/turnos/check-availability?fecha=${date}&hora=${time}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ disponible: false });
  });

  it.each(['Cancelado', 'cancelled', 'CANCELADO'])(
    'debería dejar disponible el horario para turnos en estado %s',
    async (cancelledStatus) => {
      const findOne = jest.spyOn(Turno, 'findOne').mockImplementation(async (criteria) => {
        const excludesCancelledStatus = criteria.estado.$nin.includes(cancelledStatus);
        return excludesCancelledStatus ? null : { estado: cancelledStatus };
      });

      const response = await request(app)
        .get(`/api/turnos/check-availability?fecha=${date}&hora=${time}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ disponible: true });
      expect(findOne).toHaveBeenCalledWith(expect.objectContaining({
        estado: { $nin: ['Cancelado', 'cancelled', 'CANCELADO'] },
      }));
    }
  );

  it('debería responder 401 cuando no se envía token', async () => {
    const response = await request(app)
      .get(`/api/turnos/check-availability?fecha=${date}&hora=${time}`);

    expect(response.statusCode).toBe(401);
  });

  it('debería listar los turnos ordenados del usuario autenticado', async () => {
    const turnos = [{ fecha: date, hora: time }];
    const sort = jest.fn().mockResolvedValue(turnos);
    const find = jest.spyOn(Turno, 'find').mockReturnValue({ sort });

    const response = await request(app)
      .get('/api/turnos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(turnos);
    expect(find).toHaveBeenCalledWith({ usuarioId: userId });
    expect(sort).toHaveBeenCalledWith({ fecha: 1, hora: 1 });
  });

  it('debería responder 500 si falla la consulta de turnos', async () => {
    jest.spyOn(Turno, 'find').mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('database unavailable')),
    });

    const response = await request(app)
      .get('/api/turnos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.mensaje).toBe('Error al obtener turnos');
  });

  it('debería rechazar la creación si el horario ya está ocupado', async () => {
    const findOne = jest.spyOn(Turno, 'findOne').mockResolvedValue({ _id: 'turno-existente' });

    const response = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${token}`)
      .send({ fecha: date, hora: time, pacienteNombre: 'Paciente de prueba' });

    expect(response.statusCode).toBe(400);
    expect(response.body.mensaje).toMatch(/horario ya fue tomado/);
    expect(findOne).toHaveBeenCalledWith(expect.objectContaining({ fecha: date, hora: time }));
  });

  it('debería crear un turno si el horario está disponible', async () => {
    jest.spyOn(Turno, 'findOne').mockResolvedValue(null);
    const save = jest.spyOn(Turno.prototype, 'save').mockResolvedValue();
    User.findById.mockResolvedValue({ _id: userId, fcmToken: 'test-fcm-token' });
    sendPushNotification.mockResolvedValue({ error: 'NotRegistered' });
    const exec = jest.fn().mockResolvedValue();
    const findByIdAndUpdate = jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ exec });

    const response = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${token}`)
      .send({ fecha: date, hora: time, pacienteNombre: 'Paciente de prueba' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      fecha: date,
      hora: time,
      pacienteNombre: 'Paciente de prueba',
      usuarioId: userId,
    });
    expect(save).toHaveBeenCalled();
    expect(sendPushNotification).toHaveBeenCalledWith(
      'test-fcm-token',
      '✅ Turno Confirmado',
      `Tu cita para el ${date} a las 10:30 AM ha sido agendada con éxito.`,
      expect.objectContaining({ type: 'TURNO_CONFIRMADO' })
    );
    await new Promise((resolve) => setImmediate(resolve));
    expect(findByIdAndUpdate).toHaveBeenCalledWith(userId, { fcmToken: null });
    expect(exec).toHaveBeenCalled();
  });

  it('debería responder 500 si falla la creación del turno', async () => {
    jest.spyOn(Turno, 'findOne').mockRejectedValue(new Error('database unavailable'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
      .post('/api/turnos')
      .set('Authorization', `Bearer ${token}`)
      .send({ fecha: date, hora: time, pacienteNombre: 'Paciente de prueba' });

    expect(response.statusCode).toBe(500);
    expect(response.body.mensaje).toBe('Error al crear turno');
  });

  it('debería responder 404 al cancelar un turno inexistente', async () => {
    jest.spyOn(Turno, 'findOne').mockResolvedValue(null);

    const response = await request(app)
      .delete('/api/turnos/507f1f77bcf86cd799439012')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.mensaje).toBe('Turno no encontrado');
  });

  it('debería cancelar un turno perteneciente al usuario autenticado', async () => {
    const turnoId = '507f1f77bcf86cd799439012';
    jest.spyOn(Turno, 'findOne').mockResolvedValue({ fecha: date });
    const findByIdAndDelete = jest.spyOn(Turno, 'findByIdAndDelete').mockResolvedValue({});

    const response = await request(app)
      .delete(`/api/turnos/${turnoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(findByIdAndDelete).toHaveBeenCalledWith(turnoId);
  });

  it('debería enviar una notificación al cancelar un turno', async () => {
    const turnoId = '507f1f77bcf86cd799439012';
    User.findById.mockResolvedValue({ _id: userId, fcmToken: 'test-fcm-token' });
    jest.spyOn(Turno, 'findOne').mockResolvedValue({ fecha: date });
    jest.spyOn(Turno, 'findByIdAndDelete').mockResolvedValue({});

    const response = await request(app)
      .delete(`/api/turnos/${turnoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(sendPushNotification).toHaveBeenCalledWith(
      'test-fcm-token',
      '⚠️ Turno Cancelado',
      `Has cancelado tu turno del día ${date}.`,
      { type: 'TURNO_CANCELADO' }
    );
  });

  it('debería responder 500 si falla la cancelación del turno', async () => {
    jest.spyOn(Turno, 'findOne').mockRejectedValue(new Error('database unavailable'));

    const response = await request(app)
      .delete('/api/turnos/507f1f77bcf86cd799439012')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.mensaje).toBe('Error al eliminar');
  });
});
