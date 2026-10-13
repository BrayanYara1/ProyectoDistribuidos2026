class User {
  constructor({ id, email, passwordHash, role = 'PATIENT', name }) {
    if (!email || !passwordHash) {
      throw new Error('Email and password required');
    }
    this.id = id || `usr-${Date.now()}`;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.name = name || 'System User';
    this.createdAt = new Date().toISOString();
  }
}

module.exports = User;
