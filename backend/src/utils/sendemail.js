const nodemailer = require('nodemailer');

// IMPORTANT: this is built INSIDE the function (not once at the top of the file).
// If it were built at module-load time, it would run the moment this file is
// require()'d - which can happen before dotenv.config() has run in app.js,
// meaning process.env.EMAIL_* would all be undefined and every email would
// silently fail with something like ECONNREFUSED 127.0.0.1:587.
const buildTransporter = () =>
  nodemailer.createTransport(
    process.env.EMAIL_SERVICE
      ? {
          service: process.env.EMAIL_SERVICE, // e.g. "gmail"
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }
      : {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_PORT === '465',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }
  );

/**
 * Sends an email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = buildTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;