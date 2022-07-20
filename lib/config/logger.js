const pino = require('pino').default;
const config = require('./config');

module.exports = pino(
  {
    transport: config.env !== 'production' && {
      target: 'pino-pretty',
      options: { destination: './.log' },
    },
    redact: ['req.headers.authorization'],
  },
  pino.destination({ dest: './.log', sync: false, append: false })
);
