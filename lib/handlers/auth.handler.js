const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');
const usersService = require('../services/users.service');

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
  sendVerificationEmail: async (request) => {
    try {
      const verifyEmailToken = await tokenService.generateVerifyEmailToken(request.payload.userId);
      const { email } = await usersService.getUserById(request.payload.userId);
      const info = await emailService.sendVerificationEmail(email, verifyEmailToken);
      request.logger.info(info);
      return { success: true };
    } catch (error) {
      request.logger.error(error);
      return { success: false };
    }
  },
  verifyEmail: async (request) => {
    const res = await authService.verifyEmail(request.query.token);
    return res;
  },
  forgotPassword: async (request) => {
    try {
      const userId = request.auth.credentials.userId;
      const resetPasswordToken = await tokenService.generateResetPasswordToken(userId);
      const { email } = await usersService.getUserById(userId);
      const info = await emailService.sendResetPasswordEmail(email, resetPasswordToken);
      request.logger.info(info);
      return { success: true };
    } catch (error) {
      request.logger.error(error);
      return { success: false };
    }
  },
  resetPassword: async (request) => {
    const res = await authService.resetPassword(request.query.token, request.payload.password);
    return res;
  },
};
