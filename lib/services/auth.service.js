const Boom = require('@hapi/boom');
const { tokenTypes } = require('../config/tokens');
const Token = require('../models/Token');
const Users = require('../models/Users');
const tokenService = require('./token.service');
const usersService = require('./users.service');

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await usersService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    return Boom.unauthorized();
  }
  const token = await tokenService.generateAuthToken(user.id);
  return {
    token,
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

const register = async (userPayload) => {
  if (await Users.isEmailTaken(userPayload.email)) return Boom.badData('Email is already taken');
  const res = await usersService.createUser(userPayload);
  return res;
};

const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken);
    const user = await usersService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      return Boom.unauthorized('Try to register');
    }
    await Token.deleteMany({ user: verifyEmailTokenDoc.user, type: tokenTypes.VERIFY_EMAIL });
    await usersService.updateUserById(verifyEmailTokenDoc.user, { isEmailVerified: true });
    return { verified: true };
  } catch (error) {
    return Boom.badRequest(error.message);
  }
};

const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken);
    const user = await usersService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      return Boom.unauthorized('Try to register');
    }
    await Token.deleteMany({ user: resetPasswordTokenDoc.user, type: tokenTypes.RESET_PASSWORD });
    await usersService.updateUserById(resetPasswordTokenDoc.user, { password: newPassword });
    return { isReset: true };
  } catch (error) {
    return Boom.badRequest(error.message);
  }
};

module.exports = { loginUserWithEmailAndPassword, register, verifyEmail, resetPassword };
