const Joi = require('joi');
const userHandler = require('../handlers/users.handler');

module.exports = [
  {
    path: '/users',
    method: 'GET',
    handler: userHandler.getUser,
    options: {
      tags: ['api'],
      description: 'Get user',
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required().description('Bearer YOUR_TOKEN'),
        }).unknown(),
      },
      response: {
        schema: Joi.object({
          email: Joi.string().email(),
          name: Joi.string(),
        }).unknown(),
      },
    },
  },
  {
    path: '/users',
    method: 'PUT',
    handler: userHandler.updateUser,
    options: {
      tags: ['api'],
      description: 'Update user',
      payload: {
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          email: Joi.string().email().description('Your active email'),
          name: Joi.string().description('Your full name'),
        }),
        headers: Joi.object({
          authorization: Joi.string().required().description('Bearer YOUR_TOKEN'),
        }).unknown(),
      },
      response: {
        schema: Joi.object({
          updated: Joi.boolean(),
        }),
      },
    },
  },
  {
    path: '/users',
    method: 'DELETE',
    handler: userHandler.deleteUser,
    options: {
      tags: ['api'],
      description: 'Delete user',
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
          deleted: Joi.boolean(),
        }),
      },
    },
  },
];
