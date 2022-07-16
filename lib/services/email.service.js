const nodemailer = require('nodemailer');

exports.transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

if (process.env.NODE_ENV !== 'test') {
  exports.transport
    .verify()
    .then(() => console.info('Connected to email server'))
    .catch(() =>
      console.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

const sendEmail = async (to, subject, text) => {
  const msg = { from: process.env.EMAIL_FROM, to, subject, text };
  return exports.transport.sendMail(msg);
};

exports.sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://${process.env.HOST}:${process.env.PORT}/auth/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  return sendEmail(to, subject, text);
};

exports.sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const text = `token: ${token}`;
  return sendEmail(to, subject, text);
};
