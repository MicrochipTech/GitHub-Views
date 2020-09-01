const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const indexCtrl = require("../controllers/IndexCtrl");
const { updateRepositories } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");

router.get("/VERSION", (req, res) => {
  res.send(VERSION);
});

router.get("/", indexCtrl.home);
router.get("/forceUpdate", async (req, res) => {
  updateRepositories();
  res.send("ok started");
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
