const Users = require('../models/Users');
const Boom = require('@hapi/boom');
const jwt = require('@hapi/jwt');
const bcrypt = require('../config/bcrypt');

module.exports = {
  login: async (request, h) => {
    const { email, password } = request.payload;
    const account = await Users.findOne({ email });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return Boom.unauthorized();
    }
    const token = jwt.token.generate(
      { email: account.email, aud: 'urn:audience:api', iss: 'urn:issuer:api' },
      process.env.JWT_SECRET
    );
    return h.response({ token, name: account.name, photo: account.photo, title: account.title });
  },
  register: async (request, h) => {
    if (request.payload && Array.isArray(request.payload)) return Boom.badData();
    const account = await Users.create(request.payload);
    return h.response(account);
  },
  logout: async (request, h) => {
    const account = await Users.deleteOne({ email: request.auth.credentials.email });
    return h.response({ deleted: Boolean(account.deletedCount) });
  },
};
