const hapiAuthJwt = require('@hapi/jwt');
const Token = require('../models/Token');

const generateAuthToken = (userId) => {
  return hapiAuthJwt.token.generate(
    { userId, aud: 'urn:audience:api', iss: 'urn:issuer:api' },
    process.env.JWT_SECRET,
    { ttlSec: parseInt(process.env.AUTH_TOKEN_EXPIRES) }
  );
};

const generateToken = (userId) => {
  return hapiAuthJwt.token.generate(
    {
      userId,
      aud: 'urn:audience:api',
      iss: 'urn:issuer:api',
    },
    process.env.JWT_SECRET,
    { ttlSec: parseInt(process.env.TOKEN_EXPIRES) }
  );
};

const saveToken = async (token, userId) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
  });
  return tokenDoc;
};

const generateVerifyEmailToken = async (userId) => {
  const verifyEmailToken = generateToken(userId);
  const { token } = await saveToken(verifyEmailToken, userId);
  return token;
};

const verifyToken = async (token) => {
  const artifacts = hapiAuthJwt.token.decode(token);
  const payload = artifacts.decoded.payload;
  hapiAuthJwt.token.verify(artifacts, process.env.JWT_SECRET);
  return Token.findOne({ token, user: payload.userId });
};

const generateResetPasswordToken = async (userId) => {
  const resetPasswordToken = generateToken(userId);
  const { token } = await saveToken(resetPasswordToken, userId);
  return token;
};

module.exports = {
  generateAuthToken,
  generateToken,
  saveToken,
  generateVerifyEmailToken,
  verifyToken,
  generateResetPasswordToken,
};
