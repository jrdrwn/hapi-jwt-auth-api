const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');
const Boom = require('@hapi/boom');
const packageJson = require('../package.json');
const jwtAuth = require('./auth/jwt.auth');
const authRouter = require('./routes/auth.route');
const usersRouter = require('./routes/users.router');
const logger = require('./config/logger');
const config = require('./config/config');

const server = Hapi.server({
  port: config.port,
  host: config.hostname,
  routes: {
    cors: true,
    validate: {
      failAction: async (request, h, err) => {
        request.logger.error(err);
        if (config.env === 'production') {
          throw Boom.badRequest(err.message);
        } else {
          throw err;
        }
      },
    },
  },
});

const init = async () => {
  await mongoose.connect(config.mongoose.url);

  await server.register(require('@hapi/vision'));
  await server.register(require('@hapi/inert'));
  await server.register({
    plugin: require('hapi-swagger'),
    options: {
      info: {
        title: 'HapiJS JWT Auth API Documentation',
        version: packageJson.version,
        description: packageJson.description,
        contact: {
          name: packageJson.author.name,
          email: packageJson.author.email,
          url: packageJson.author.url,
        },
        license: { name: packageJson.license, url: 'https://choosealicense.com/licenses/mit/' },
      },
    },
  });
  await server.register(require('@hapi/jwt'));
  await server.register({
    plugin: require('hapi-pino'),
    options: {
      instance: logger,
    },
  });

  server.auth.strategy(jwtAuth.name, jwtAuth.schema, jwtAuth.options);

  server.auth.default(jwtAuth.name);

  server.route(authRouter);
  server.route(usersRouter);

  await server.initialize();

  return server;
};

const start = async () => {
  await init();
  await server.start();

  return server;
};

process.on('unhandledRejection', (err) => {
  logger.error(err);
  process.exit(1);
});

module.exports = { server, init, start };
