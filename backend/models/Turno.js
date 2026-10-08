const mongoose = require('mongoose');
const { turnosConnection } = require('../config/dbConnections');

const OutboxEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    type: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    occurredAt: { type: Date, required: true, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    publishedAt: { type: Date, default: null }
}, { _id: false });

const TurnoSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true },
    pacienteNombre: { type: String, required: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    motivo: { type: String, default: "General" },
    especialidad: { type: String, default: "General" },
    doctor: { type: String, default: "Dr. Asignado" },
    estado: { type: String, default: "Pendiente" },
    sagaStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'COMPENSATED'],
        default: 'PENDING'
    },
    demoFail: { type: Boolean, default: false },
    outboxEvents: { type: [OutboxEventSchema], default: [] }
});

TurnoSchema.index(
    { fecha: 1, hora: 1 },
    {
        unique: true,
        partialFilterExpression: { estado: { $in: ['Pendiente', 'Confirmado'] } }
    }
);

module.exports = turnosConnection.model('Turno', TurnoSchema);
