const hapiAuthJwt = require('@hapi/jwt');

exports.generateAuthToken = (userId) => {
  return hapiAuthJwt.token.generate(
    { userId, aud: 'urn:audience:api', iss: 'urn:issuer:api' },
    process.env.JWT_SECRET
  );
};
