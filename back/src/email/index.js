const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'transcendence424242@gmail.com',
    pass: 'qcop umte ieny rgnt'
  }
});

module.exports = transporter;
