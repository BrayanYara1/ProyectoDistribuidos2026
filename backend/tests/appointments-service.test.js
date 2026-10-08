const request = require('supertest');
const app = require('../services/appointments-service/server');

describe('appointments service health and local failure control', () => {
    it('reports liveness when MongoDB and RabbitMQ are unavailable', async () => {
        const response = await request(app).get('/health/live');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('alive');
    });

    it('reports degraded readiness while required dependencies are unavailable', async () => {
        const response = await request(app).get('/health/ready');

        expect(response.status).toBe(503);
        expect(response.body.status).toBe('degraded');
        expect(response.body.broker).toBe('disconnected');
    });

    it('keeps failure injection disabled unless explicitly enabled', async () => {
        const response = await request(app).post('/api/demo/fail-next-saga');

        expect(response.status).toBe(404);
    });
});
