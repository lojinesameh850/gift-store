require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'MISSING');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test email from Gift Store backend',
  html: '<p>If you got this, your email config works.</p>'
})
  .then((info) => console.log('SUCCESS:', info.response))
  .catch((err) => console.error('FAILED:', err));