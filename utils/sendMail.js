const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_HOST_SERVICE,
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: 465,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    html: options.message
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
