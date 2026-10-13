const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const originalAuthServiceUrl = process.env.AUTH_SERVICE_URL;
const originalServiceToken = process.env.SERVICE_TOKEN;
const originalFetch = global.fetch;
process.env.AUTH_SERVICE_URL = 'http://auth-service.test';
process.env.SERVICE_TOKEN = 'test-service-token';

const authenticateToken = require('../middleware/auth');
const app = express();
app.get('/private', authenticateToken, (req, res) => res.json({
    userId: req.userId,
    email: req.user.email
}));
const token = jwt.sign({ userId: 'patient-1' }, process.env.JWT_SECRET || 'SaludActiva_Secret_Key_2024');

afterAll(() => {
    if (originalAuthServiceUrl === undefined) delete process.env.AUTH_SERVICE_URL;
    else process.env.AUTH_SERVICE_URL = originalAuthServiceUrl;
    if (originalServiceToken === undefined) delete process.env.SERVICE_TOKEN;
    else process.env.SERVICE_TOKEN = originalServiceToken;
    global.fetch = originalFetch;
});

describe('auth service contract middleware', () => {
    it('loads the user through the auth service contract', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 'patient-1', email: 'patient@example.test' })
        });

        const response = await request(app)
            .get('/private')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ userId: 'patient-1', email: 'patient@example.test' });
        expect(global.fetch).toHaveBeenCalledWith(
            'http://auth-service.test/internal/users/patient-1',
            expect.objectContaining({
                headers: { 'x-service-token': 'test-service-token' }
            })
        );
    });

    it('rejects tokens whose subject no longer exists in the owning service', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

        const response = await request(app)
            .get('/private')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
    });

    it('returns a service-unavailable response when the contract is unreachable', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));

        const response = await request(app)
            .get('/private')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(503);
    });
});
