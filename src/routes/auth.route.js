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
            title: Joi.string(),
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
          title: Joi.string().required().description('Your job title'),
        }),
      },
      response: {
        schema: Joi.object({
          email: Joi.string().email(),
          photo: Joi.string().allow('').uri(),
          name: Joi.string(),
          title: Joi.string(),
        }).unknown(),
      },
    },
  },
  {
    path: '/auth/logout',
    method: 'DELETE',
    handler: authHandler.logout,
    options: {
      auth: {
        mode: 'required',
      },
      description: 'Delete your account',
      notes: 'Attention: will permanently delete your registered account on the server',
      tags: ['api'],
      payload: {
        multipart: true,
      },
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required().description('Your token'),
        }).unknown(),
      },
      response: {
        schema: Joi.object({
          deleted: Joi.boolean(),
        }),
      },
    },
  },
];
