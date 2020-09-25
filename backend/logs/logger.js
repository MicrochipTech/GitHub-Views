const nodemailer = require("nodemailer");
const winston = require("winston");

let logger;
let transporter;

if (process.env.ENVIRONMENT === "production") {
  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message, stack }) =>
          `${timestamp} ${level}: ${message} ${stack ? "\n" + stack : ""}`
      )
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "logs/all.log", level: "info" }),
    ],
  });

  transporter = nodemailer.createTransport({
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
} else if (process.env.ENVIRONMENT === "development") {
  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        ({ timestamp, level, message, stack }) =>
          `${timestamp} ${level}: ${message} ${stack ? "\n" + stack : ""}`
      )
    ),
    transports: [new winston.transports.Console()],
  });
} else {
  console.log(
    `ERROR: Set the ENVIRONMENT variable in .env file correctly. Default logger will be set...`
  );

  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "logs/all.log", level: "info" }),
    ],
  });
}

function sendMail(to, subject, html) {
  /* Send mails only in production mode */
  if (process.env.ENVIRONMENT !== "production") return;

  const mailOptions = {
    from: process.env.MAIL_AUTH_USER,
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      logger.error({
        message: err,
        stack: err.stack,
      });
    } else {
      logger.info({
        message: info,
      });
    }
  });
}

function errorHandler(msg, err, email = true) {
  logger.error({
    message: msg,
    stack: err.stack,
  });

  if (email) {
    sendMail(
      process.env.MAIL_ADMINS.split(" ") /* email to send to */,
      "Report from GitHub Views" /* subject */,
      `<p>${msg}<br><br>${err.message}<br><br>${err.stack}</p>` /* html text */
    );
  }
}

module.exports = {
  logger,
  errorHandler,
  sendMail,
};
