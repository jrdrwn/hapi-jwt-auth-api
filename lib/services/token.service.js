const hapiAuthJwt = require('@hapi/jwt');
const Token = require('../models/Token');

exports.generateAuthToken = (userId) => {
  return hapiAuthJwt.token.generate(
    { userId, aud: 'urn:audience:api', iss: 'urn:issuer:api' },
    process.env.JWT_SECRET,
    { ttlSec: parseInt(process.env.AUTH_TOKEN_EXPIRES) }
  );
};

exports.generateToken = (userId) => {
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

exports.saveToken = async (token, userId) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
  });
  return tokenDoc;
};

exports.generateVerifyEmailToken = async (userId) => {
  const verifyEmailToken = exports.generateToken(userId);
  const { token } = await exports.saveToken(verifyEmailToken, userId);
  return token;
};

exports.verifyToken = async (token) => {
  const artifacts = hapiAuthJwt.token.decode(token);
  const payload = artifacts.decoded.payload;
  hapiAuthJwt.token.verify(artifacts, process.env.JWT_SECRET);
  return Token.findOne({ token, user: payload.userId });
};

exports.generateResetPasswordToken = async (userId) => {
  const resetPasswordToken = exports.generateToken(userId);
  const { token } = await exports.saveToken(resetPasswordToken, userId);
  return token;
};
