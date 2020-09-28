const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const { updateRepositoriesTask } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");
const { logger, errorHandler } = require("../logs/logger");
const UserCtrl = require("../controllers/UserCtrl");
const sendMonthlyReports = require("../config/montlyEmailReport");

router.get("/VERSION", (req, res) => {
  res.send(VERSION);
});

router.get("/forceUpdate", async (req, res) => {
  updateRepositoriesTask();
  res.send("ok started");
});

router.get("/sendReports", (req, res) => {
  sendMonthlyReports();
  res.send("started");
});

router.get("/unset_user_emails", async (req, res) => {
  try {
    const users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true },
    }).populate("token_ref");

    const updatePromises = users.map(async (user) => {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        { $unset: { githubEmails: "" } }
      );
    });
    await Promise.all(updatePromises);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all emails for users.`,
      err
    );
  }

  res.send("mails unset");
});

router.get("/get_user_emails", async (req, res) => {
  try {
    const users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true },
    }).populate("token_ref");

    let usersToUpdate = users.length;

    const updatePromises = users.map(async (user) => {
      const success = await UserCtrl.updateProfile(user);
      if (success) {
        usersToUpdate -= 1;
      } else {
        logger.warn(`Email update fail for user ${user.username}.`);
      }

      logger.info(`${usersToUpdate} users left to update...`);
    });
    await Promise.all(updatePromises);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting emails for users.`,
      err
    );
  }
  res.send("mails stored");
});

router.get("/migration_step1", async (req, res) => {
  res.send("started");

  try {
    /* Rename views to views2 */
    const renameRepos = await RepositoryModel.find();
    const renamePromises = renameRepos.map(async (repo) => {
      await RepositoryModel.findOneAndUpdate(
        { _id: repo._id },
        { $rename: { views: "views2" } }
      );
    });
    await Promise.all(renamePromises);

    // for await (const repo of RepositoryModel.find().cursor()) {
    //   await RepositoryModel.findOneAndUpdate(
    //     { _id: repo._id },
    //     { $rename: { views: "views2" } }
    //   );
    // }
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while updating all repos from database.`,
      err
    );
  }
  logger.warn(`${arguments.callee.name}: Complete.`);
});

router.get("/migration_step2", async (req, res) => {
  res.send("started");

  try {
    /* Structure views like clones */
    const repos = await RepositoryModel.find();
    const updatePromises = repos.map(async (repo) => {
      const views = {
        total_count: repo.views2.reduce(
          (accumulator, currentView) => accumulator + currentView.count,
          0
        ),
        total_uniques: repo.views2.reduce(
          (accumulator, currentView) => accumulator + currentView.uniques,
          0
        ),
        data: repo.views2.map((v) => {
          return {
            timestamp: v.timestamp,
            count: v.count,
            uniques: v.uniques,
          };
        }),
      };

      await RepositoryModel.findOneAndUpdate(
        { _id: repo._id },
        {
          views: views,
          $unset: { user_id: "", views2: "", count: "", uniques: "" },
        }
      );
    });
    await Promise.all(updatePromises);

    // for await (const repo of RepositoryModel.find().cursor()) {
    //   const views = {
    //     total_count: repo.views2.reduce(
    //       (accumulator, currentView) => accumulator + currentView.count,
    //       0
    //     ),
    //     total_uniques: repo.views2.reduce(
    //       (accumulator, currentView) => accumulator + currentView.uniques,
    //       0
    //     ),
    //     data: repo.views2.map((v) => {
    //       return {
    //         timestamp: v.timestamp,
    //         count: v.count,
    //         uniques: v.uniques,
    //       };
    //     }),
    //   };

    //   await RepositoryModel.findOneAndUpdate(
    //     { _id: repo._id },
    //     {
    //       views: views,
    //       $unset: { user_id: "", views2: "", count: "", uniques: "" },
    //     }
    //   );
    // }
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while updating all repos from database.`,
      err
    );
  }

  logger.warn(`${arguments.callee.name}: Complete.`);
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
