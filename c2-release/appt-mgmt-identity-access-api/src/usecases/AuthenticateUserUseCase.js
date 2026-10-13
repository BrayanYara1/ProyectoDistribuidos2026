class AuthenticateUserUseCase {
  constructor(usersMap, tokenService) {
    this.usersMap = usersMap;
    this.tokenService = tokenService;
  }

  execute(email, password) {
    const user = this.usersMap.get(email);
    if (!user || user.passwordHash !== password) {
      throw new Error('Invalid credentials');
    }
    const token = this.tokenService.generateToken(user);
    return {
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
      token
    };
  }
}

module.exports = AuthenticateUserUseCase;
