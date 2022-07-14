const Boom = require('@hapi/boom');
const Users = require('../models/Users');
const tokenService = require('./token.service');
const usersService = require('./users.service');

exports.loginUserWithEmailAndPassword = async (email, password) => {
  const user = await usersService.getUserByEmail(email);
  console.log(user);
  if (!user || !(await user.isPasswordMatch(password))) {
    return Boom.unauthorized();
  }
  const token = tokenService.generateAuthToken(user.id);
  return {
    token,
    user: {
      name: user.name,
      photo: user.photo,
      email: user.email,
      role: user.role,
    },
  };
};

exports.register = async (userPayload) => {
  if (await Users.isEmailTaken(userPayload.email)) return Boom.badData('Email is already taken');
  const res = await usersService.createUser(userPayload);
  return res;
};
