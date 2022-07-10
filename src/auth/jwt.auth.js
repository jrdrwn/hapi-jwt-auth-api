const Users = require('../models/Users');

module.exports = {
  name: 'jwt',
  schema: 'jwt',
  options: {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: 'urn:audience:api',
      iss: 'urn:issuer:api',
      sub: false,
    },
    validate: async (artifacts) => {
      const userId = artifacts.decoded.payload.userId;
      const account = await Users.findById(userId);
      if (!account) return { isValid: false };
      return {
        isValid: true,
        credentials: { userId },
      };
    },
  },
};
