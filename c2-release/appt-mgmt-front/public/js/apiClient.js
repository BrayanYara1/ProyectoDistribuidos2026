class ApiClient {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async login(email, password) {
    const res = await fetch(`${this.baseUrl}/api/v1/iam/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  }

  async getAppointments(token) {
    const res = await fetch(`${this.baseUrl}/api/v1/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
}

if (typeof module !== 'undefined') {
  module.exports = ApiClient;
}
