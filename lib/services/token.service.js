const hapiAuthJwt = require('@hapi/jwt');
const Token = require('../models/Token');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

const generateAuthToken = async (userId) => {
  const expires = 60 * 60 * 24 * config.jwt.authExpirationDays;
  const authToken = generateToken(userId, expires, tokenTypes.AUTH);
  const { token } = await saveToken(authToken, userId, expires, tokenTypes.AUTH);
  return token;
};

const generateToken = (userId, expires, type) => {
  return hapiAuthJwt.token.generate(
    {
      userId,
      type,
      aud: 'urn:audience:api',
      iss: 'urn:issuer:api',
    },
    process.env.JWT_SECRET,
    { ttlSec: expires }
  );
};

const saveToken = async (token, userId, expires, type) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires,
    type,
  });
  return tokenDoc;
};

const generateVerifyEmailToken = async (userId) => {
  const expires = 60 * config.jwt.verifyEmailExpirationMinutes;
  const verifyEmailToken = generateToken(userId, expires, tokenTypes.VERIFY_EMAIL);
  const { token } = await saveToken(verifyEmailToken, userId, expires, tokenTypes.VERIFY_EMAIL);
  return token;
};

const verifyToken = async (token) => {
  const artifacts = hapiAuthJwt.token.decode(token);
  const payload = artifacts.decoded.payload;
  hapiAuthJwt.token.verify(artifacts, process.env.JWT_SECRET);
  return Token.findOne({ token, user: payload.userId });
};

const generateResetPasswordToken = async (userId) => {
  const expires = 60 * config.jwt.resetPasswordExpirationMinutes;
  const resetPasswordToken = generateToken(userId, expires, tokenTypes.RESET_PASSWORD);
  const { token } = await saveToken(resetPasswordToken, userId, expires, tokenTypes.RESET_PASSWORD);
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
