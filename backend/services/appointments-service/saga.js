function createAppointmentSaga({ Appointment, authClient }) {
    async function finish(appointmentId, state, eventType, reservationId) {
        const eventId = `${appointmentId}:${eventType}`;
        return Appointment.findOneAndUpdate(
            { _id: appointmentId, sagaStatus: 'PENDING' },
            {
                $set: {
                    sagaStatus: state === 'Confirmado' ? 'COMPLETED' : 'COMPENSATED',
                    estado: state
                },
                $push: {
                    outboxEvents: {
                        eventId,
                        type: eventType,
                        version: 1,
                        occurredAt: new Date(),
                        payload: { appointmentId, reservationId }
                    }
                }
            },
            { new: true }
        );
    }

    async function handleRequested(event) {
        const appointment = await Appointment.findById(event.payload.appointmentId);
        if (!appointment || appointment.sagaStatus !== 'PENDING') return;

        let reservationCreated = false;
        try {
            await authClient.reserveAppointment(appointment.id, appointment.usuarioId);
            reservationCreated = true;
            if (event.payload.demoFail === true) {
                const failure = new Error('Injected demo failure after auth reservation');
                failure.demoFailure = true;
                throw failure;
            }

            const confirmed = await finish(
                appointment.id,
                'Confirmado',
                'appointment.confirmed.v1',
                appointment.id
            );
            if (!confirmed) await authClient.releaseAppointment(appointment.id);
        } catch (error) {
            const permanentRejection = error.status === 404 || error.status === 409;
            if (!permanentRejection && !error.demoFailure) throw error;

            if (reservationCreated) {
                await authClient.releaseAppointment(appointment.id);
            }
            await finish(appointment.id, 'Cancelado', 'appointment.cancelled.v1', appointment.id);
            if (error.demoFailure) {
                console.warn(`Saga compensated demo appointment ${appointment.id}`);
            } else {
                console.warn(`Saga rejected appointment ${appointment.id}: ${error.message}`);
            }
        }
    }

    return { handleRequested };
}

module.exports = { createAppointmentSaga };
