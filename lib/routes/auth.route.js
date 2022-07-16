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
          created: Joi.boolean(),
          email: Joi.string().email(),
          userId: Joi.string(),
        }),
      },
    },
  },
  {
    path: '/auth/forgot-password',
    method: 'POST',
    handler: authHandler.forgotPassword,
    options: {
      tags: ['api'],
      description: 'Send token to email for reset password',
      payload: {
        multipart: true,
      },
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required().description('Bearer YOUR_TOKEN'),
        }).unknown(),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
        }),
      },
    },
  },
  {
    path: '/auth/reset-password',
    method: 'PUT',
    handler: authHandler.resetPassword,
    options: {
      tags: ['api'],
      description: 'Reset password',
      validate: {
        query: Joi.object({
          token: Joi.string().required().description('Your reset token from email'),
        }),
        payload: Joi.object({
          password: Joi.string().required().description('New password'),
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('Bearer YOUR_TOKEN'),
        }).unknown(),
      },
      response: {
        schema: Joi.object({
          isReset: Joi.boolean(),
        }).unknown(),
      },
    },
  },
  {
    path: '/auth/send-verification-email',
    method: 'POST',
    handler: authHandler.sendVerificationEmail,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Send verification email',
      notes: 'Send verification email',
      payload: {
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          userId: Joi.string().required().description('Your user id'),
        }),
      },
      response: {
        schema: Joi.object({
          success: Joi.boolean(),
        }).unknown(),
      },
    },
  },
  {
    path: '/auth/verify-email',
    method: 'GET',
    handler: authHandler.verifyEmail,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Verify email',
      notes: 'Verify email for login at /auth/login',
      validate: {
        query: Joi.object({
          token: Joi.string().required().description('Your token'),
        }),
      },
      response: {
        schema: Joi.object({
          verified: Joi.boolean(),
        }).unknown(),
      },
    },
  },
];
