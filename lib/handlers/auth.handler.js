const Users = require('../models/Users');
const Boom = require('@hapi/boom');
const jwt = require('@hapi/jwt');
const bcrypt = require('../utils/bcrypt');

module.exports = {
  login: async (request, h) => {
    const { email, password } = request.payload;
    const account = await Users.findOne({ email });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return Boom.unauthorized();
    }
    const token = jwt.token.generate(
      { userId: account.id, aud: 'urn:audience:api', iss: 'urn:issuer:api' },
      process.env.JWT_SECRET
    );
    return h.response({
      token,
      user: {
        name: account.name,
        photo: account.photo,
        email: account.email,
        role: account.role,
      },
    });
  },
  register: async (request, h) => {
    if (request.payload && Array.isArray(request.payload)) return Boom.badData();
    const check = await Users.findOne({ email: request.payload.email });
    if (check) return Boom.badData('Email is already in use');
    const account = await Users.create(request.payload);
    return h.response({ created: true, userId: account.id });
  },
};