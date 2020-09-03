var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    type: process.env.MAIL_AUTH_TYPE,
    user: process.env.MAIL_AUTH_USER,
    clientId: process.env.MAIL_AUTH,
    clientSecret: process.env.MAIL_AUTH_CLIENT_SECRET,
    refreshToken: process.env.MAIL_AUTH_REFRESH_TOKEN,
    accessToken: process.env.MAIL_AUTH_ACCESS_TOKEN,
    expires: process.env.MAIL_AUTH_EXPIRES,
  },
});

function logger(msg, err) {
  console.log(msg);

  const mailOptions = {
    from: process.env.MAIL_AUTH_USER,
    to: process.env.MAIL_ADMINS.split(" "),
    subject: "Report from GitHub Views",
    html: `<p>${msg}<br><br>${err}</p>`,
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
}

module.exports = {
  logger,
};
