const { tokenTypes } = require('../config/tokens');
const Token = require('../models/Token');
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
      exp: true,
    },
    validate: async (artifacts) => {
      const token = artifacts.token;
      const userId = artifacts.decoded.payload.userId;
      const tokenType = artifacts.decoded.payload.type;
      const account = await Users.findById(userId);
      const tokenCheck = await Token.findOne({ token, user: userId, type: tokenTypes.AUTH });
      if (!account || tokenType !== tokenTypes.AUTH || !tokenCheck) return { isValid: false };
      return {
        isValid: true,
        credentials: { userId },
      };
    },
  },
};
