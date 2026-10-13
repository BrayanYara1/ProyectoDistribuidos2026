const baseUrl = () => {
    if (!process.env.AUTH_SERVICE_URL) {
        throw new Error('AUTH_SERVICE_URL must be configured for the appointments service');
    }
    if (!process.env.SERVICE_TOKEN) {
        throw new Error('SERVICE_TOKEN must be configured for the appointments service');
    }
    return process.env.AUTH_SERVICE_URL.replace(/\/$/, '');
};

async function sendReservationRequest(path, options = {}) {
    let response;
    try {
        response = await fetch(`${baseUrl()}${path}`, {
            ...options,
            headers: {
                'content-type': 'application/json',
                'x-service-token': process.env.SERVICE_TOKEN,
                ...options.headers
            },
            signal: AbortSignal.timeout(3000)
        });
    } catch (error) {
        throw new Error(`Auth service contract unavailable: ${error.message}`, { cause: error });
    }

    if (!response.ok) {
        const error = new Error(`Auth service contract returned ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function reserveAppointment(reservationId, userId) {
    return sendReservationRequest('/internal/reservations', {
        method: 'POST',
        body: JSON.stringify({ reservationId, userId })
    });
}

function releaseAppointment(reservationId) {
    return sendReservationRequest(`/internal/reservations/${encodeURIComponent(reservationId)}`, {
        method: 'DELETE'
    });
}

module.exports = { reserveAppointment, releaseAppointment };
