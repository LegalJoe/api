const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.LEGALJOEEMAIL_USER,
    pass: process.env.LEGALJOEPASSWORD  //this should be set to an env-when we deploy
  }
});

module.exports.transporter = transporter
module.exports.emailFrom = process.env.LEGALJOEEMAIL
