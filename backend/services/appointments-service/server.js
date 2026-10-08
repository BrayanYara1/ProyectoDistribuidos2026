require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Turno = require('../../models/Turno');
const { connectDatabase, closeDatabase, getDatabaseStatus } = require('../../config/dbConnections');
const messaging = require('./messaging');
const { reserveAppointment, releaseAppointment } = require('./authClient');

const app = express();
const port = Number(process.env.APPOINTMENTS_PORT || 3002);
const secret = process.env.JWT_SECRET || 'SaludActiva_Secret_Key_2024';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

function requireUser(req, res, next) {
    const token = req.get('authorization')?.split(/\s+/)[1];
    if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });
    try {
        const decoded = jwt.verify(token, secret);
        if (!decoded.userId) return res.status(403).json({ mensaje: 'Token inválido o expirado' });
        req.userId = String(decoded.userId);
        return next();
    } catch {
        return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
}

app.get('/api/turnos', requireUser, async (req, res) => {
    try {
        const appointments = await Turno.find({ usuarioId: req.userId }).sort({ fecha: 1, hora: 1 });
        return res.json(appointments);
    } catch (error) {
        console.error('Appointment list failed:', error.message);
        return res.status(503).json({ mensaje: 'Error al obtener turnos' });
    }
});

app.get('/api/turnos/check-availability', requireUser, async (req, res) => {
    const { fecha, hora } = req.query;
    if (!fecha || !hora) return res.status(400).json({ mensaje: 'fecha y hora son obligatorias' });
    try {
        const occupied = await Turno.exists({ fecha, hora });
        return res.json({ disponible: !occupied });
    } catch (error) {
        console.error('Appointment availability check failed:', error.message);
        return res.status(503).json({ mensaje: 'Error al verificar disponibilidad' });
    }
});

app.post('/api/turnos', requireUser, async (req, res) => {
    const body = req.body || {};
    const { fecha, hora } = body;
    if (!fecha || !hora) return res.status(400).json({ mensaje: 'fecha y hora son obligatorias' });

    const appointmentId = new mongoose.Types.ObjectId();
    const requestEvent = {
        eventId: `${appointmentId}:appointment.requested.v1`,
        type: 'appointment.requested.v1',
        version: 1,
        occurredAt: new Date(),
        payload: {
            appointmentId,
            userId: req.userId,
            demoFail: process.env.DEMO_FAILURE_ENABLED === 'true'
                && messaging.consumeNextSagaFailure()
        },
        publishedAt: null
    };
    const appointment = new Turno({
        ...body,
        _id: appointmentId,
        usuarioId: req.userId,
        pacienteNombre: body.pacienteNombre || body.nombre || 'Paciente',
        doctor: body.doctor || body.medico || 'Dr. Asignado',
        estado: 'Pendiente',
        sagaStatus: 'PENDING',
        outboxEvents: [requestEvent]
    });

    try {
        await appointment.save();
        void messaging.connect().catch(error => {
            console.error('Saga broker unavailable; appointment remains pending in outbox:', error.message);
        });
        return res.status(202).json(appointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'Este horario ya fue tomado por otro paciente' });
        }
        console.error('Appointment creation failed:', error.message);
        return res.status(503).json({ mensaje: 'Error al crear turno' });
    }
});

app.delete('/api/turnos/:id', requireUser, async (req, res) => {
    try {
        const appointment = await Turno.findOne({
            _id: req.params.id,
            usuarioId: req.userId
        });
        if (!appointment) return res.status(404).json({ mensaje: 'Turno no encontrado' });
        if (appointment.sagaStatus === 'COMPLETED') {
            await releaseAppointment(appointment.id);
        }
        appointment.estado = 'Cancelado';
        appointment.sagaStatus = 'COMPENSATED';
        appointment.outboxEvents.push({
            eventId: `${appointment.id}:appointment.cancelled.v1`,
            type: 'appointment.cancelled.v1',
            version: 1,
            occurredAt: new Date(),
            payload: { appointmentId: appointment.id, userId: req.userId },
            publishedAt: null
        });
        await appointment.save();
        void messaging.connect().catch(error => {
            console.error('Cancellation event remains persisted in outbox:', error.message);
        });
        return res.status(200).send();
    } catch (error) {
        console.error('Appointment cancellation failed:', error.message);
        return res.status(503).json({ mensaje: 'Error al eliminar' });
    }
});

app.post('/api/demo/fail-next-saga', (req, res) => {
    if (process.env.DEMO_FAILURE_ENABLED !== 'true') {
        return res.status(404).json({ message: 'Demo failure injection is disabled' });
    }
    const demoToken = process.env.DEMO_FAILURE_TOKEN;
    if (!demoToken || req.get('x-demo-token') !== demoToken) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    messaging.requestNextSagaFailure();
    return res.status(202).json({ status: 'failure_armed' });
});

app.get('/health/live', (req, res) => res.json({ status: 'alive' }));
app.get('/health/ready', (req, res) => {
    const database = getDatabaseStatus().domains.turnos;
    const ready = database.status === 'connected' && messaging.isConnected();
    return res.status(ready ? 200 : 503).json({
        status: ready ? 'ready' : 'degraded',
        database,
        broker: messaging.isConnected() ? 'connected' : 'disconnected'
    });
});

async function start() {
    connectDatabase().catch(error => {
        console.error('Appointments MongoDB unavailable; API remains live but not ready:', error.message);
    });
    messaging.connect().catch(error => {
        console.error('Saga broker unavailable at startup; persisted outbox will retry:', error.message);
    });
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Appointments service listening on ${port}`);
    });
    const shutdown = signal => {
        console.log(`Appointments service received ${signal}`);
        server.close(error => {
            if (error) {
                console.error('Appointments HTTP shutdown failed:', error.message);
                process.exitCode = 1;
            }
            Promise.all([closeDatabase(), messaging.closeMessaging()]).catch(closeError => {
                console.error('Appointments service shutdown failed:', closeError.message);
                process.exitCode = 1;
            });
        });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
    start().catch(error => {
        console.error('Appointments service startup failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = app;
