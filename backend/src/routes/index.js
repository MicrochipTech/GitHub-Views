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
const RepoModel = require("../models/Repository").default;
const repoHooks = require("../repoHooks").default;
const cleanDuplicates = require("../scripts/cleanDuplicates");

const restRouter = require("./rest").default;

router.use("/rest", restRouter);

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

router.get("/VERSION", (_req, res) => {
  res.send(VERSION);
});

router.get("/forceUpdate", async (_req, res) => {
  updateRepositoriesTask();
  res.send("ok started");
});

router.get("/runOnCreateHook", async (_req, res) => {
  const total = await RepoModel.count({});
  let i = 1;

  for await (const r of RepoModel.find({}).cursor()) {
    repoHooks.onRepoCreate?.(r);
    console.log(`${i++}/${total}`);
  }

  res.send("done");
});

router.get("/sendReports", (_req, res) => {
  sendMonthlyReports();
  res.send("started");
});

router.get("/cleanDuplicates", async (_req, res) => {
  res.send("Started.");
  await cleanDuplicates();
  console.log("Done");
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
