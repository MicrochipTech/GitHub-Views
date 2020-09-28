const cron = require("node-cron");
const { logger, errorHandler } = require("../logs/logger");
const sendMonthlyReports = require("./montlyEmailReport");
const updateRepositoriesAsynch = require("./updateRepositoriesAsynch");
const {
  updateRepositoriesGenerator,
  runGenerator,
} = require("./updateRepositoriesWithBackoff");

/* Using back off is way slower because requests are made sequential.
Still, being slower actually reduces the chance of making 5000+ requests per hour. */
const UPDATE_WITH_BACK_OFF_ON_ERROR = false;

async function setRepoUpdateCron() {
  logger.info(
    `${arguments.callee.name}: Setting a cronjob every day, to update repositories.`
  );
  cron.schedule("25 12 * * *", async () => {
    if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
      runGenerator(updateRepositoriesGenerator());
    } else {
      try {
        await updateRepositoriesTask();
      } catch (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught in daily repositories update.`,
          err
        );
      }
    }
  });
}

async function updateRepositoriesTask() {
  if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
    try {
      await runGenerator(updateRepositoriesGenerator());
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught in daily repositories update.`,
        err
      );
    }
  } else {
    try {
      await updateRepositoriesAsynch();
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught in daily repositories update.`,
        err
      );
    }
  }
}

function setMonthlySummaryEmailCron() {
  logger.info("Setting monthly cron for summary emails.");
  cron.schedule("0 0 1 * *", sendMonthlyReports);
}

module.exports = {
  setRepoUpdateCron,
  setMonthlySummaryEmailCron,
  updateRepositoriesTask,
};
