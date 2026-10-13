class EventPublisher {
  constructor() {
    this.publishedEvents = [];
  }

  publish(eventName, payload) {
    const event = {
      eventName,
      payload,
      timestamp: new Date().toISOString()
    };
    this.publishedEvents.push(event);
    return event;
  }
}

module.exports = EventPublisher;
