const generateFromTemplate = require("./reportEmailTemplate");
const { logger, errorHandler, sendMail } = require("../logs/logger");
const UserModel = require("../models/User");
const UserCtrl = require("../controllers/UserCtrl");

async function sendMonthlyReports() {
  logger.info(`${arguments.callee.name}: Sending monthly reports...`);

  let users;
  try {
    users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true },
    }).populate("token_ref");
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all users from database.`,
      err
    );
  }

  usersReportPromises = users.map(async (user) => {
    let emailAddress;
    const emails = user.githubEmails.filter((e) => e.verified);
    if (emails.length === 0) {
      /* If there are no verified emails, then no email is send. */
      logger.info(`User ${user.username} does not have email address.`);
      return;
    } else if (emails.length === 1) {
      emailAddress = emails[0].email;
    } else {
      /* If there is more than one  */
      const emailIndex = emails.find((e) => e.primary);
      if (emailIndex === -1) {
        emailAddress = emails[0].email;
      } else {
        emailAddress = emails[emailIndex].email;
      }
    }

    /* Get data for the last 30 days continaing: sum of the views, clones and forks. */
    const { success, data } = await UserCtrl.getLastXDaysData(user, 30);
    if (success === false) return;

    /* Compute a score for each user's repo and sort them. */
    const repositoriesTop = data
      .map((d) => {
        return {
          ...d,
          score:
            d.forks_count * 10 +
            d.clones_uniques * 8 +
            d.clones_count * 3 +
            d.views_uniques * 5 +
            d.views_count * 2,
        };
      })
      .sort((d1, d2) => d2.score - d1.score);

    if (repositoriesTop.length >= 5) {
      const email = generateFromTemplate(
        user.username,
        data.reduce((acc, item) => acc + item.views_count, 0),
        data.reduce((acc, item) => acc + item.clones_count, 0),
        data.reduce((acc, item) => acc + item.forks_count, 0),
        repositoriesTop[0].reponame,
        repositoriesTop[1].reponame,
        repositoriesTop[2].reponame,
        repositoriesTop[3].reponame,
        repositoriesTop[4].reponame
      );
      sendMail(emailAddress, "GHV Monthly Summary", email);
    }
  });
}

module.exports = sendMonthlyReports;
