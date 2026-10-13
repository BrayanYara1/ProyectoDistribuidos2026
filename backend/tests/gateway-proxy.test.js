const http = require('http');
const request = require('supertest');

const originalAuthServiceUrl = process.env.AUTH_SERVICE_URL;
const originalAppointmentsServiceUrl = process.env.APPOINTMENTS_SERVICE_URL;
let downstream;
let app;
let received;

beforeAll(async () => {
    downstream = http.createServer((req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            received = {
                method: req.method,
                url: req.url,
                body: Buffer.concat(chunks).toString()
            };
            res.writeHead(202, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ forwarded: true }));
        });
    });
    await new Promise(resolve => downstream.listen(0, '127.0.0.1', resolve));
    const target = `http://127.0.0.1:${downstream.address().port}`;
    process.env.AUTH_SERVICE_URL = target;
    process.env.APPOINTMENTS_SERVICE_URL = target;
    app = require('../server');
});

afterAll(async () => {
    await new Promise((resolve, reject) => downstream.close(error => error ? reject(error) : resolve()));
    if (originalAuthServiceUrl === undefined) delete process.env.AUTH_SERVICE_URL;
    else process.env.AUTH_SERVICE_URL = originalAuthServiceUrl;
    if (originalAppointmentsServiceUrl === undefined) delete process.env.APPOINTMENTS_SERVICE_URL;
    else process.env.APPOINTMENTS_SERVICE_URL = originalAppointmentsServiceUrl;
});

describe('API gateway service routing', () => {
    it('forwards auth paths and request bodies unchanged', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'patient@example.test', contrasena: 'secret' });

        expect(response.status).toBe(202);
        expect(response.body.forwarded).toBe(true);
        expect(received).toEqual({
            method: 'POST',
            url: '/api/auth/login',
            body: JSON.stringify({ email: 'patient@example.test', contrasena: 'secret' })
        });
    });

    it('forwards appointment paths and preserves query parameters', async () => {
        const response = await request(app)
            .get('/api/turnos/check-availability?fecha=2026-10-10&hora=09%3A00');

        expect(response.status).toBe(202);
        expect(received.url).toBe('/api/turnos/check-availability?fecha=2026-10-10&hora=09%3A00');
    });

    it('routes the local demo failure control to Appointments', async () => {
        const response = await request(app).post('/api/demo/fail-next-saga');

        expect(response.status).toBe(202);
        expect(received.url).toBe('/api/demo/fail-next-saga');
    });
});
