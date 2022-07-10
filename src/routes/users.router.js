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
          email: Joi.string().email(),
          photo: Joi.string().allow('').uri(),
          name: Joi.string(),
          role: Joi.string(),
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
      description: 'Update profil user',
      payload: {
        multipart: true,
      },
      validate: {
        payload: Joi.object({
          email: Joi.string().email().description('Your active email'),
          photo: Joi.string().allow('').uri().description('URI of your profile photo'),
          name: Joi.string().description('Your full name'),
          role: Joi.string().description('Your job role'),
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
        payload: Joi.object({
          email: Joi.string().email().required().description('Your registered email'),
          password: Joi.string().required().description('The password you created'),
        }),
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
