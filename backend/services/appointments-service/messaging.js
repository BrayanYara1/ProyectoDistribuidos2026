const amqp = require('amqplib');
const Appointment = require('../../models/Turno');
const authClient = require('./authClient');
const { createAppointmentSaga } = require('./saga');

const exchangeName = 'salud-activa.events.v1';
const queueName = 'appointments.saga.v1';
const deadLetterExchange = `${exchangeName}.dead`;
const deadLetterQueue = `${queueName}.dead`;
let connection;
let channel;
let connecting;
let reconnectTimer;
let pollingTimer;
let relayRunning = false;
let failNextSaga = false;
let stopping = false;
const saga = createAppointmentSaga({
    Appointment,
    authClient
});

function isConnected() {
    return Boolean(connection && channel);
}

async function publish(event) {
    const body = Buffer.from(JSON.stringify(event));
    await new Promise((resolve, reject) => {
        channel.publish(
            exchangeName,
            event.type,
            body,
            { contentType: 'application/json', persistent: true, messageId: event.eventId },
            error => error ? reject(error) : resolve()
        );
    });
}

async function relayOutbox() {
    if (!isConnected() || relayRunning) return;
    relayRunning = true;
    try {
        const pending = await Appointment.find({
            outboxEvents: { $elemMatch: { publishedAt: null } }
        }).limit(50);
        for (const appointment of pending) {
            for (const event of appointment.outboxEvents) {
                if (event.publishedAt) continue;
                await publish(event.toObject ? event.toObject() : event);
                await Appointment.updateOne(
                    { _id: appointment._id, 'outboxEvents.eventId': event.eventId },
                    { $set: { 'outboxEvents.$.publishedAt': new Date() } }
                );
            }
        }
    } catch (error) {
        console.error('Outbox relay failed; pending events remain persisted:', error.message);
    } finally {
        relayRunning = false;
    }
}

async function consume(message, consumerChannel) {
    if (!message) return;
    try {
        const event = JSON.parse(message.content.toString());
        if (event.type === 'appointment.requested.v1') {
            await saga.handleRequested(event);
        }
        consumerChannel.ack(message);
    } catch (error) {
        const attempts = Number(message.properties.headers['x-retry-count'] || 0);
        const deadLetter = attempts >= 5;
        console.error(
            `Saga message processing failed (${attempts + 1}/6):`,
            error.message
        );
        setTimeout(() => {
            if (channel !== consumerChannel) return;
            const destination = deadLetter ? deadLetterExchange : exchangeName;
            consumerChannel.publish(
                destination,
                deadLetter ? 'appointment.failed.v1' : message.fields.routingKey,
                message.content,
                {
                    contentType: message.properties.contentType,
                    persistent: true,
                    messageId: message.properties.messageId,
                    headers: {
                        ...message.properties.headers,
                        'x-retry-count': attempts + 1
                    }
                },
                publishError => {
                    if (publishError) {
                        console.error('Failed to persist saga retry:', publishError.message);
                        consumerChannel.nack(message, false, true);
                    } else {
                        if (deadLetter) {
                            console.error('Saga message sent to dead-letter queue after 6 attempts');
                        }
                        consumerChannel.ack(message);
                    }
                }
            );
        }, 1000);
    }
}

async function connect() {
    if (isConnected()) return;
    if (connecting) return connecting;
    connecting = (async () => {
        const brokerUrl = process.env.RABBITMQ_URL;
        if (!brokerUrl) throw new Error('RABBITMQ_URL is required');
        try {
            connection = await amqp.connect(brokerUrl, { timeout: 3000 });
            connection.on('error', error => {
                console.error('RabbitMQ connection error:', error.message);
            });
            connection.on('close', () => {
                connection = undefined;
                channel = undefined;
                console.warn('RabbitMQ disconnected; outbox events remain persisted');
                scheduleReconnect();
            });

            channel = await connection.createConfirmChannel();
            await channel.assertExchange(exchangeName, 'topic', { durable: true });
            await channel.assertExchange(deadLetterExchange, 'topic', { durable: true });
            await channel.assertQueue(deadLetterQueue, { durable: true });
            await channel.bindQueue(deadLetterQueue, deadLetterExchange, 'appointment.failed.v1');
            await channel.assertQueue(queueName, { durable: true });
            await channel.bindQueue(queueName, exchangeName, 'appointment.requested.v1');
            await channel.prefetch(10);
            const consumerChannel = channel;
            await consumerChannel.consume(
                queueName,
                message => consume(message, consumerChannel),
                { noAck: false }
            );
            if (!pollingTimer) pollingTimer = setInterval(relayOutbox, 1000);
            void relayOutbox();
            console.log('RabbitMQ saga consumer and transactional outbox relay connected');
        } catch (error) {
            if (connection) await connection.close().catch(closeError => {
                console.error('RabbitMQ cleanup failed:', closeError.message);
            });
            connection = undefined;
            channel = undefined;
            scheduleReconnect();
            throw error;
        }
    })().finally(() => {
        connecting = undefined;
    });
    return connecting;
}

function scheduleReconnect() {
    if (stopping || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        connect().catch(error => {
            console.error('RabbitMQ reconnect failed; will retry:', error.message);
        });
    }, 2000);
}

function requestNextSagaFailure() {
    failNextSaga = true;
}

function consumeNextSagaFailure() {
    const shouldFail = failNextSaga;
    failNextSaga = false;
    return shouldFail;
}

async function closeMessaging() {
    stopping = true;
    clearInterval(pollingTimer);
    clearTimeout(reconnectTimer);
    pollingTimer = undefined;
    reconnectTimer = undefined;
    if (connection) await connection.close();
    connection = undefined;
    channel = undefined;
}

module.exports = {
    connect,
    isConnected,
    publish,
    requestNextSagaFailure,
    consumeNextSagaFailure,
    closeMessaging
};
