const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const { updateRepositories } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const { logger, errorHandler } = require("../logs/logger");
const UserCtrl = require("../controllers/UserCtrl");

router.get("/VERSION", (req, res) => {
  res.send(VERSION);
});

router.get("/forceUpdate", async (req, res) => {
  updateRepositories();
  res.send("ok started");
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
router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
