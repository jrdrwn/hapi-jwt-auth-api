const Joi = require('joi');
const authHandler = require('../handlers/auth.handler');

module.exports = [
  {
    method: 'POST',
    path: '/auth/login',
    handler: authHandler.login,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Login to server',
      notes:
        'Login to the server using the email and password you created in /auth/register to get a token',
      payload: {
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().description('Your registered email'),
          password: Joi.string().required().description('The password you created'),
        }),
      },
      response: {
        schema: Joi.object({
          token: Joi.string(),
          user: Joi.object({
            name: Joi.string(),
            email: Joi.string().email(),
            role: Joi.string(),
            photo: Joi.string().allow('').uri(),
          }),
        }),
      },
    },
  },
  {
    path: '/auth/register',
    method: 'PUT',
    handler: authHandler.register,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Create a new account',
      notes: 'Create a new account to login at /auth/login',
      payload: {
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().description('Your active email'),
          password: Joi.string().required().description('Strongest password'),
          photo: Joi.string().allow('').uri().optional().description('URI of your profile photo'),
          name: Joi.string().required().description('Your full name'),
          role: Joi.string().required().description('Your job role'),
        }),
      },
      response: {
        schema: Joi.object({
          email: Joi.string().email(),
          photo: Joi.string().allow('').uri(),
          name: Joi.string(),
          role: Joi.string(),
        }).unknown(),
      },
    },
  },
];
