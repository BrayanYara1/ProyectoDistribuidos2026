const request = require('supertest');
const app = require('../server');
const { closeDatabase, getDatabaseStatus } = require('../config/dbConnections');

describe('service health endpoints', () => {
  beforeAll(async () => {
    await closeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('keeps the API online and reports database degradation', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.database.status).toBe('disconnected');
    expect(Object.keys(res.body.database.domains)).toEqual([
      'auth',
      'turnos',
      'medicamentos',
      'estudios',
      'chat'
    ]);
    expect(Object.values(res.body.database.domains).map(domain => domain.database))
      .toEqual(expect.arrayContaining([
        expect.stringMatching(/_auth$/),
        expect.stringMatching(/_turnos$/),
        expect.stringMatching(/_medicamentos$/),
        expect.stringMatching(/_estudios$/),
        expect.stringMatching(/_chat$/)
      ]));
    expect(getDatabaseStatus().status).toBe('disconnected');
  });

  it('reports liveness while the database is unavailable', async () => {
    const res = await request(app).get('/health/live');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  it('reports the service as not ready while the database is unavailable', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database.status).toBe('disconnected');
  });

  it('uses a unique active appointment slot and keeps cancelled slots reusable', () => {
    const Turno = require('../models/Turno');
    const slotIndex = Turno.schema.indexes().find(([fields]) =>
      fields.fecha === 1 && fields.hora === 1
    );

    expect(slotIndex[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { estado: { $in: ['Pendiente', 'Confirmado'] } }
    });
  });

  it('debería responder 404 para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');
    expect(res.statusCode).toEqual(404);
  });
});
