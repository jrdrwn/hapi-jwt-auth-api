require('dotenv').config();

const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth.route');
const jwtAuth = require('./auth/jwt.auth');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const package = require('../package.json');

const init = async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: true,
    },
  });

  const swaggerOptions = {
    info: {
      title: 'HapiJS JWT Auth API Documentation',
      version: package.version,
      description: package.description,
      contact: {
        name: package.author.name,
        email: package.author.email,
        url: package.author.url,
      },
      license: { name: package.license, url: 'https://choosealicense.com/licenses/mit/' },
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

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

  await server.start();
};

process.on('unhandledRejection', (err) => {
  console.info(err);
  process.exit(1);
});

init();
