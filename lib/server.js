require('dotenv').config();

const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');
const Boom = require('@hapi/boom');
const packageJson = require('../package.json');
const jwtAuth = require('./auth/jwt.auth');
const authRouter = require('./routes/auth.route');
const usersRouter = require('./routes/users.router');

const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  routes: {
    cors: true,
    validate: {
      failAction: async (request, h, err) => {
        request.logger.error(err);
        if (process.env.NODE_ENV === 'production') {
          throw Boom.badRequest(err.message);
        } else {
          throw err;
        }
      },
    },
  },
});

exports.init = async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  await server.register(require('@hapi/vision'));
  await server.register(require('@hapi/inert'));
  await server.register(require('hapi-swagger'), {
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
  });
  await server.register(require('@hapi/jwt'));
  await server.register({
    plugin: require('hapi-pino'),
    options: {
      transport: process.env.NODE_ENV !== 'production' && {
        target: 'pino-pretty',
      },
      redact: ['req.headers.authorization'],
    },
  });

  server.auth.strategy(jwtAuth.name, jwtAuth.schema, jwtAuth.options);

  server.auth.default(jwtAuth.name);

  server.route(authRouter);
  server.route(usersRouter);

  await server.initialize();

  return server;
};

exports.start = async () => {
  await exports.init();
  await server.start();

  return server;
};

process.on('unhandledRejection', (err) => {
  console.err(err);
  process.exit(1);
});
