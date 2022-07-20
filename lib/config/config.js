const Joi = require('joi');

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  HOSTNAME: Joi.string().hostname().default('0.0.0.0'),
  PORT: Joi.number().port().default(3000),
  HOST: Joi.string(),
  MONGODB_URL: Joi.string().required().description('Mongo DB url'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_AUTH_EXPIRATION_DAYS: Joi.number()
    .default(30)
    .description('days after which auth tokens expire'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description('minutes after which reset password token expires'),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description('minutes after which verify email token expires'),
  SMTP_HOST: Joi.string().description('server that will send the emails'),
  SMTP_PORT: Joi.number().default(587).description('port to connect to the email server'),
  SMTP_USER: Joi.string().description('username for email server'),
  SMTP_PASS: Joi.string().description('password for email server'),
  EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  hostname: envVars.HOSTNAME,
  port: envVars.PORT,
  host: envVars.HOST || `${envVars.HOSTNAME}:${envVars.PORT}`,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    authExpirationDays: envVars.JWT_AUTH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
