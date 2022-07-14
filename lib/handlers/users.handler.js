const usersService = require('../services/users.service');

module.exports = {
  updateUser: async (request) => {
    const res = await usersService.updateUserById(request.auth.credentials.userId, request.payload);
    return res;
  },
  getUser: async (request) => {
    const res = await usersService.getUserById(request.auth.credentials.userId);
    return res;
  },
  deleteUser: async (request) => {
    const res = await usersService.deleteUserById(request.auth.credentials.userId);
    return res;
  },
};
