class JwtTokenService {
  constructor(secret = 'supersecretkey2026') {
    this.secret = secret;
  }

  generateToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    return `${header}.${body}.mocked_signature`;
  }
}

module.exports = JwtTokenService;
