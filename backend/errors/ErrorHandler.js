var nodemailer = require("nodemailer");
const winston = require("winston");

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    type: process.env.MAIL_AUTH_TYPE,
    user: process.env.MAIL_AUTH_USER,
    clientId: process.env.MAIL_AUTH_CLIENT_ID,
    clientSecret: process.env.MAIL_AUTH_CLIENT_SECRET,
    refreshToken: process.env.MAIL_AUTH_REFRESH_TOKEN,
    accessToken: process.env.MAIL_AUTH_ACCESS_TOKEN,
    expires: process.env.MAIL_AUTH_EXPIRES,
  },
});

const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "info.log", level: "info" }),
  ],
});

function logger(msg, err, email = true) {
  winstonLogger.log({
    level: "error",
    message: msg,
    stack: err.stack,
  });

  const mailOptions = {
    from: process.env.MAIL_AUTH_USER,
    to: process.env.MAIL_ADMINS.split(" "),
    subject: "Report from GitHub Views",
    html: `<p>${msg}<br><br>${err.message}<br><br>${err.stack}</p>`,
  };

  if (email) {
    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.log(err);
        winstonLogger.log({
          level: "error",
          message: err,
        });
      } else {
        console.log(info);
        winstonLogger.log({
          level: "info",
          message: info,
        });
      }
    });
  }
}

module.exports = {
  logger,
};
