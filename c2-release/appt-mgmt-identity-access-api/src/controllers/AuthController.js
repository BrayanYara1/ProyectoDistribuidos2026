class AuthController {
  constructor(authenticateUserUseCase) {
    this.authenticateUserUseCase = authenticateUserUseCase;
  }

  login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }
      const result = this.authenticateUserUseCase.execute(email, password);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }
}

module.exports = AuthController;
