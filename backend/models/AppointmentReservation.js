const mongoose = require('mongoose');
const { authConnection } = require('../config/dbConnections');

const AppointmentReservationSchema = new mongoose.Schema({
    reservationId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    status: { type: String, enum: ['RESERVED', 'RELEASED'], required: true }
}, { timestamps: true });

module.exports = authConnection.model('AppointmentReservation', AppointmentReservationSchema);
