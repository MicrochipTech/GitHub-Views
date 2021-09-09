const cron = require("node-cron");
const { logger, errorHandler } = require("../logs/logger");
const cleanDuplicates = require("../scripts/cleanDuplicates");
const sendMonthlyReports = require("./montlyEmailReport");
const updateRepositoriesAsynch = require("./updateRepositoriesAsynch");
const dailyUpdate = require("./updateRepositories").default;
const {
  updateRepositoriesGenerator,
  runGenerator,
} = require("./updateRepositoriesWithBackoff");
const to = require("await-to-js").default;

/* Using back off is way slower because requests are made sequential.
Still, being slower actually reduces the chance of making 5000+ requests per hour. */

const MODES = {
  LEGACY: 0,
  CURSORS: 1,
  BACK_OFF: 2
}

const UPDATE_MODE = MODES.CURSORS;

async function setRepoUpdateCron() {
  logger.info(
    `${arguments.callee.name}: Setting a cronjob every day, to update repositories.`
  );
  cron.schedule("25 12 * * *", async () => {

    const [err] = await to(updateRepositoriesTask());
    if (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught in daily repositories update.`,
        err
      );
    }
  });
}

async function updateRepositoriesTask() {

  switch (UPDATE_MODE) {
    case MODES.LEGACY:
      
      logger.info("LEGACY MODE");
      /* WARNING: running cleanDuplicates here is a dirty find
       * TODO: the root cause of the duplicates creation should be fixed
       * INFO: this will require in-depts debugging of the updateRepositoriesAsynch function */

      const [err] = await to(updateRepositoriesAsynch());
      !err && ([err] = await to(cleanDuplicates()));
      if (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught in daily repositories update.`,
          err
        );
      }
      break;

    case MODES.CURSORS:

      logger.info("CURSOR MODE");
      const [err] = await to(dailyUpdate());
      if (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught in daily repositories update.`,
          err
        );
      }
      break;

    case MODES.BACK_OFF:

      logger.info("BACK-OFF MODE");
      const [err] = await to(runGenerator(updateRepositoriesGenerator()));
      if (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught in daily repositories update.`,
          err
        );
      }
      break;

    default:

    console.log("Mode not supported...");
      return;
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
