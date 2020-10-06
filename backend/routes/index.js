const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const { updateRepositoriesTask } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");
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

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
