function authForwarder(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    req.headers['x-forwarded-auth'] = authHeader;
  }
  next();
}

module.exports = authForwarder;
