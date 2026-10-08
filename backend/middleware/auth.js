const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'SaludActiva_Secret_Key_2024';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ mensaje: "Token no proporcionado" });

    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return res.status(403).json({ mensaje: "Token inválido o expirado" });
    }

    try {
        let user;
        if (process.env.AUTH_SERVICE_URL) {
            const serviceToken = process.env.SERVICE_TOKEN;
            if (!serviceToken) {
                console.error('SERVICE_TOKEN is required when AUTH_SERVICE_URL is configured');
                return res.status(503).json({ mensaje: "Servicio de autenticación no disponible" });
            }
            const response = await fetch(
                `${process.env.AUTH_SERVICE_URL.replace(/\/$/, '')}/internal/users/${encodeURIComponent(decoded.userId)}`,
                {
                    headers: { 'x-service-token': serviceToken },
                    signal: AbortSignal.timeout(3000)
                }
            );
            if (response.status === 404) {
                return res.status(401).json({ mensaje: "Usuario ya no existe" });
            }
            if (!response.ok) {
                console.error(`Auth contract returned ${response.status}`);
                return res.status(503).json({ mensaje: "Servicio de autenticación no disponible" });
            }
            user = await response.json();
        } else {
            const User = require('../models/User');
            user = await User.findById(decoded.userId);
            if (!user) return res.status(401).json({ mensaje: "Usuario ya no existe" });
        }

        req.userId = decoded.userId;
        req.user = user;
        return next();
    } catch (error) {
        console.error('Auth contract request failed:', error.message);
        return res.status(503).json({ mensaje: "Servicio de autenticación no disponible" });
    }
};

module.exports = authenticateToken;
