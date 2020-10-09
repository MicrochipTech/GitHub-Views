const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const { updateRepositoriesTask } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");
const sendMonthlyReports = require("../config/montlyEmailReport");
const { logger, errorHandler } = require("../logs/logger");
const UserModel = require("../models/User");

router.get("/remove_tokens", async (req, res) => {
  res.send("ok started");

  try {
    const users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true },
    });

    const updatePromises = users.map(async (user) => {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $unset: { token: "", _ac: "", _ct: "" },
        }
      );
    });
    await Promise.all(updatePromises);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while removing tokens for users.`,
      err
    );
  }

  logger.info("Delete tokens completed.");
});

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

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
