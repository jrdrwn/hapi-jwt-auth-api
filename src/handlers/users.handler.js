const Users = require('../models/Users');
const Boom = require('@hapi/boom');
const bcrypt = require('../config/bcrypt');

module.exports = {
  updateUser: async (request, h) => {
    const userId = request.auth.credentials.userId;
    const userRes = await Users.updateOne({ _id: userId }, request.payload);
    return h.response({ updated: Boolean(userRes.modifiedCount) });
  },
  getUser: async (request, h) => {
    const userId = request.auth.credentials.userId;
    const user = await Users.findById(userId).select('-password -_id');
    return h.response(user);
  },
  deleteUser: async (request, h) => {
    const { email, password } = request.payload;
    const userId = request.auth.credentials.userId;
    const account = await Users.findOne({ _id: userId, email });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return Boom.unauthorized();
    }
    const deletedRes = await Users.deleteOne({ _id: userId });
    return h.response({ deleted: Boolean(deletedRes.deletedCount) });
  },
};
