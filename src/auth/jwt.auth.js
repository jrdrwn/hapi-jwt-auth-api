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
      const account = await Users.findOne({ email: artifacts.decoded.payload.email });
      if (!account) return { isValid: false };
      return {
        isValid: true,
        credentials: { email: artifacts.decoded.payload.email },
      };
    },
  },
};
