const { createAppointmentSaga } = require('../../services/appointments-service/saga');

function createHarness(reservationError) {
    const appointment = {
        id: 'appointment-1',
        usuarioId: 'patient-1',
        sagaStatus: 'PENDING'
    };
    const Appointment = {
        findById: jest.fn().mockResolvedValue(appointment),
        findOneAndUpdate: jest.fn().mockResolvedValue({ ...appointment })
    };
    const authClient = {
        reserveAppointment: jest.fn().mockImplementation(() => {
            if (reservationError) return Promise.reject(reservationError);
            return Promise.resolve({ status: 'RESERVED' });
        }),
        releaseAppointment: jest.fn().mockResolvedValue({ status: 'RELEASED' })
    };
    return {
        appointment,
        Appointment,
        authClient,
        saga: createAppointmentSaga({ Appointment, authClient })
    };
}

const requestedEvent = demoFail => ({
    eventId: 'appointment-1:appointment.requested.v1',
    type: 'appointment.requested.v1',
    version: 1,
    payload: { appointmentId: 'appointment-1', demoFail }
});

describe('appointment saga', () => {
    it('reserves the auth-domain appointment and emits a confirmation', async () => {
        const { Appointment, authClient, saga } = createHarness();

        await saga.handleRequested(requestedEvent(false));

        expect(authClient.reserveAppointment).toHaveBeenCalledWith('appointment-1', 'patient-1');
        expect(authClient.releaseAppointment).not.toHaveBeenCalled();
        expect(Appointment.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'appointment-1', sagaStatus: 'PENDING' },
            expect.objectContaining({
                $set: { sagaStatus: 'COMPLETED', estado: 'Confirmado' },
                $push: expect.objectContaining({
                    outboxEvents: expect.objectContaining({ type: 'appointment.confirmed.v1' })
                })
            }),
            { new: true }
        );
    });

    it('compensates a persisted auth reservation after a demo failure', async () => {
        const { Appointment, authClient, saga } = createHarness();

        await saga.handleRequested(requestedEvent(true));

        expect(authClient.reserveAppointment).toHaveBeenCalledTimes(1);
        expect(authClient.releaseAppointment).toHaveBeenCalledWith('appointment-1');
        expect(Appointment.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'appointment-1', sagaStatus: 'PENDING' },
            expect.objectContaining({
                $set: { sagaStatus: 'COMPENSATED', estado: 'Cancelado' },
                $push: expect.objectContaining({
                    outboxEvents: expect.objectContaining({ type: 'appointment.cancelled.v1' })
                })
            }),
            { new: true }
        );
    });

    it('compensates invalid-user requests without creating an auth reservation', async () => {
        const error = new Error('user not found');
        error.status = 404;
        const { Appointment, authClient, saga } = createHarness(error);

        await saga.handleRequested(requestedEvent(false));

        expect(authClient.releaseAppointment).not.toHaveBeenCalled();
        expect(Appointment.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'appointment-1', sagaStatus: 'PENDING' },
            expect.objectContaining({
                $set: { sagaStatus: 'COMPENSATED', estado: 'Cancelado' }
            }),
            { new: true }
        );
    });

    it('retries transient contract errors instead of reporting false success', async () => {
        const { Appointment, saga } = createHarness(new Error('auth service unavailable'));

        await expect(saga.handleRequested(requestedEvent(false)))
            .rejects.toThrow('auth service unavailable');
        expect(Appointment.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('does not repeat side effects for an already completed saga', async () => {
        const { Appointment, authClient, saga } = createHarness();
        Appointment.findById.mockResolvedValue({ id: 'appointment-1', sagaStatus: 'COMPLETED' });

        await saga.handleRequested(requestedEvent(false));

        expect(authClient.reserveAppointment).not.toHaveBeenCalled();
        expect(Appointment.findOneAndUpdate).not.toHaveBeenCalled();
    });
});
