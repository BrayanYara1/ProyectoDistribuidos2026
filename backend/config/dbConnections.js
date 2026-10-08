const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/SaludActiva';
const uriWithoutOptions = mongoUri.split('?')[0];
const lastSlash = uriWithoutOptions.lastIndexOf('/');
const schemeEnd = uriWithoutOptions.indexOf('://') + 3;
const baseDatabase = lastSlash > schemeEnd
    ? uriWithoutOptions.slice(lastSlash + 1) || 'SaludActiva'
    : 'SaludActiva';
const domainSuffixes = ['auth', 'turnos', 'medicamentos', 'estudios', 'chat'];
const domainUriOverrides = domainSuffixes
    .map(domain => `${domain.toUpperCase()}_MONGODB_URI`)
    .filter(variable => process.env[variable]);

if (domainUriOverrides.length > 0) {
    console.warn(
        `Per-domain MongoDB URIs are not used with the single-instance configuration: ${domainUriOverrides.join(', ')}. Configure MONGODB_URI instead.`
    );
}
const connectionOptions = {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 5000
};
const databaseConnection = mongoose.createConnection();

databaseConnection.on('error', error => {
    console.error('MongoDB connection error:', error.message);
});

databaseConnection.on('connected', () => {
    console.log('MongoDB connected');
});

databaseConnection.on('disconnected', () => {
    console.warn('MongoDB disconnected; API remains available in degraded mode');
});

const domainConnections = Object.fromEntries(
    domainSuffixes.map(domain => [
        domain,
        databaseConnection.useDb(`${baseDatabase}_${domain}`, { useCache: true })
    ])
);

function connectDatabase() {
    if (databaseConnection.readyState === 1) {
        return Promise.resolve(databaseConnection);
    }
    if (databaseConnection.readyState === 2) {
        return databaseConnection.asPromise();
    }
    return databaseConnection.openUri(mongoUri, connectionOptions);
}

function connectionStatus(connection) {
    return {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }[connection.readyState] || 'unknown';
}

function getDatabaseStatus() {
    const domains = Object.fromEntries(
        Object.entries(domainConnections).map(([domain, connection]) => [
            domain,
            {
                database: connection.name,
                status: connectionStatus(connection)
            }
        ])
    );
    const statuses = Object.values(domains).map(domain => domain.status);

    return {
        status: statuses.every(status => status === 'connected')
            ? 'connected'
            : connectionStatus(databaseConnection),
        domains
    };
}

async function closeDatabase() {
    if (databaseConnection.readyState !== 0) {
        await databaseConnection.close();
    }
}

module.exports = {
    databaseConnection,
    domainConnections,
    connectDatabase,
    getDatabaseStatus,
    closeDatabase,
    authConnection: domainConnections.auth,
    turnosConnection: domainConnections.turnos,
    medicamentosConnection: domainConnections.medicamentos,
    estudiosConnection: domainConnections.estudios,
    chatConnection: domainConnections.chat
};
