require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const https = require('https');
const { connectDatabase, getDatabaseStatus, closeDatabase } = require('./config/dbConnections');

// --- APP CONFIG ---
const app = express();
const PORT = process.env.PORT || 10000;

// Limpiador general de peticiones (100 por cada 15 min por IP)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(generalLimiter);
app.use(cors());

function proxyTo(target) {
    return (req, res) => {
        const url = new URL(req.originalUrl, target);
        const transport = url.protocol === 'https:' ? https : http;
        const proxyRequest = transport.request(url, {
            method: req.method,
            headers: { ...req.headers, host: url.host }
        }, proxyResponse => {
            res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
            proxyResponse.pipe(res);
        });
        proxyRequest.on('error', error => {
            console.error(`Service proxy failed (${url.origin}):`, error.message);
            if (!res.headersSent) {
                res.status(502).json({ mensaje: 'Servicio temporalmente no disponible' });
            } else {
                res.destroy(error);
            }
        });
        req.pipe(proxyRequest);
    };
}

if (process.env.AUTH_SERVICE_URL) {
    app.use('/api/auth', proxyTo(process.env.AUTH_SERVICE_URL));
}
if (process.env.APPOINTMENTS_SERVICE_URL) {
    app.use('/api/turnos', proxyTo(process.env.APPOINTMENTS_SERVICE_URL));
    app.use('/api/demo', proxyTo(process.env.APPOINTMENTS_SERVICE_URL));
}

app.use(express.json());

// Archivos estáticos del cliente Web (si la carpeta web existe)
app.use(express.static(path.join(__dirname, '../web')));
app.use(express.static(path.join(__dirname, 'web')));

// --- IMPORTAR RUTAS ---
const authRoutes = require('./src/infrastructure/adapters/http/express/AuthRoutes');
const turnoRoutes = require('./routes/turnos');
const medicamentoRoutes = require('./routes/medicamentos');
const estudioRoutes = require('./routes/estudios');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');

// --- USAR RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/estudios', estudioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// --- ROOT & LISTEN ---
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Salud Activa Backend Online</h1>
        <p><b>Estado DB:</b> ${getDatabaseStatus().status}</p>
        <p><b>Release:</b> MVP 2</p>
        <p><b>Fecha Servidor:</b> ${new Date().toLocaleString()}</p>
    `);
});
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        database: getDatabaseStatus(),
        timestamp: new Date()
    });
});

app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive', timestamp: new Date() });
});

app.get('/health/ready', async (req, res) => {
    const database = getDatabaseStatus();
    const dependencies = {};
    for (const [name, serviceUrl] of Object.entries({
        auth: process.env.AUTH_SERVICE_URL,
        appointments: process.env.APPOINTMENTS_SERVICE_URL
    })) {
        if (!serviceUrl) continue;
        try {
            const response = await fetch(
                `${serviceUrl.replace(/\/$/, '')}/health/ready`,
                { signal: AbortSignal.timeout(2000) }
            );
            dependencies[name] = response.ok ? 'ready' : 'degraded';
        } catch (error) {
            console.error(`Readiness check failed for ${name}:`, error.message);
            dependencies[name] = 'unavailable';
        }
    }
    const ready = database.status === 'connected'
        && Object.values(dependencies).every(status => status === 'ready');

    res.status(ready ? 200 : 503).json({
        status: ready ? 'ready' : 'degraded',
        database,
        dependencies,
        timestamp: new Date()
    });
});

if (require.main === module) {
    connectDatabase().catch(error => {
        console.error('Initial MongoDB connection failed; API remains available in degraded mode:', error.message);
    });

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        console.log(`📡 Rutas cargadas: Auth, Turnos, Medicamentos, Estudios, Admin`);
    });

    const shutdown = signal => {
        console.log(`Received ${signal}; shutting down gracefully`);
        server.close(error => {
            if (error) {
                console.error('HTTP server shutdown failed:', error.message);
                process.exitCode = 1;
            }

            closeDatabase().catch(databaseError => {
                console.error('MongoDB shutdown failed:', databaseError.message);
                process.exitCode = 1;
            });
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
