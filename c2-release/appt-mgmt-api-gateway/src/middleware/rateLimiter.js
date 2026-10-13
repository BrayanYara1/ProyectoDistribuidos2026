const requestCounts = new Map();

function rateLimiter(limit = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const clientData = requestCounts.get(ip) || { count: 0, startTime: now };

    if (now - clientData.startTime > windowMs) {
      clientData.count = 1;
      clientData.startTime = now;
    } else {
      clientData.count += 1;
    }

    requestCounts.set(ip, clientData);

    if (clientData.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
  };
}

module.exports = rateLimiter;
