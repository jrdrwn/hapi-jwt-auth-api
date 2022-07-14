const authService = require('../services/auth.service');

module.exports = {
  login: async (request) => {
    const { email, password } = request.payload;
    const res = await authService.loginUserWithEmailAndPassword(email, password);
    return res;
  },
  register: async (request) => {
    const res = await authService.register(request.payload);
    return res;
  },
};
