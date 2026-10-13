require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const authRoutes = require('../../src/infrastructure/adapters/http/express/AuthRoutes');
const User = require('../../models/User');
const AppointmentReservation = require('../../models/AppointmentReservation');
const { connectDatabase, closeDatabase, getDatabaseStatus } = require('../../config/dbConnections');

const app = express();
const port = Number(process.env.AUTH_PORT || 3001);
const serviceToken = process.env.SERVICE_TOKEN;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/internal', (req, res, next) => {
    if (!serviceToken || req.get('x-service-token') !== serviceToken) {
        return res.status(401).json({ message: 'Unauthorized service request' });
    }
    return next();
});

app.get('/internal/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            'nombre email telefono fcmToken tipoSanguineo alergias condiciones contactoEmergencia'
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            fcmToken: user.fcmToken,
            tipoSanguineo: user.tipoSanguineo,
            alergias: user.alergias,
            condiciones: user.condiciones,
            contactoEmergencia: user.contactoEmergencia
        });
    } catch (error) {
        console.error('User contract lookup failed:', error.message);
        return res.status(503).json({ message: 'Auth data unavailable' });
    }
});

app.post('/internal/reservations', async (req, res) => {
    const { reservationId, userId } = req.body;
    if (!reservationId || !userId) {
        return res.status(400).json({ message: 'reservationId and userId are required' });
    }

    try {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) return res.status(404).json({ message: 'User not found' });

        let reservation;
        try {
            reservation = await AppointmentReservation.findOneAndUpdate(
                { reservationId },
                { $setOnInsert: { reservationId, userId, status: 'RESERVED' } },
                { upsert: true, new: true, runValidators: true }
            );
        } catch (error) {
            if (error.code !== 11000) throw error;
            reservation = await AppointmentReservation.findOne({ reservationId });
        }
        if (reservation.userId !== userId || reservation.status !== 'RESERVED') {
            return res.status(409).json({ message: 'Reservation conflicts with existing state' });
        }
        return res.status(200).json({ reservationId, status: reservation.status });
    } catch (error) {
        console.error('Appointment reservation contract failed:', error.message);
        return res.status(503).json({ message: 'Auth reservation unavailable' });
    }
});

app.delete('/internal/reservations/:reservationId', async (req, res) => {
    try {
        const reservation = await AppointmentReservation.findOneAndUpdate(
            { reservationId: req.params.reservationId, status: 'RESERVED' },
            { $set: { status: 'RELEASED' } },
            { new: true }
        );
        return res.json({
            reservationId: req.params.reservationId,
            status: reservation ? reservation.status : 'RELEASED'
        });
    } catch (error) {
        console.error('Appointment reservation compensation failed:', error.message);
        return res.status(503).json({ message: 'Auth reservation unavailable' });
    }
});

app.get('/health/live', (req, res) => res.json({ status: 'alive' }));
app.get('/health/ready', (req, res) => {
    const database = getDatabaseStatus();
    const ready = database.domains.auth.status === 'connected';
    return res.status(ready ? 200 : 503).json({
        status: ready ? 'ready' : 'degraded',
        database: database.domains.auth
    });
});

async function start() {
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Auth service listening on ${port}`);
    });
    connectDatabase().catch(error => {
        console.error('Auth MongoDB unavailable; API remains live but not ready:', error.message);
    });
    const shutdown = async signal => {
        console.log(`Auth service received ${signal}`);
        server.close(async error => {
            if (error) {
                console.error('Auth HTTP shutdown failed:', error.message);
                process.exitCode = 1;
            }
            try {
                await closeDatabase();
            } catch (closeError) {
                console.error('Auth MongoDB shutdown failed:', closeError.message);
                process.exitCode = 1;
            }
        });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
    start().catch(error => {
        console.error('Auth service startup failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = app;
