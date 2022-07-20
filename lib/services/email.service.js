const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  return transport.sendMail(msg);
};

const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://${config.host}/auth/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  return sendEmail(to, subject, text);
};

const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const text = `token: ${token}`;
  return sendEmail(to, subject, text);
};

module.exports = { transport, sendVerificationEmail, sendResetPasswordEmail };
