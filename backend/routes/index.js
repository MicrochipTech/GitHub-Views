const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const { updateRepositories } = require("../config/cron-setup");
const { VERSION } = require("../VERSION");
const RepositoryModel = require("../models/Repository");
const { logger, errorHandler } = require("../logs/logger");

router.get("/VERSION", (req, res) => {
  res.send(VERSION);
});

router.get("/forceUpdate", async (req, res) => {
  updateRepositories();
  res.send("ok started");
});

router.get("/second_migration", async (req, res) => {
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
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while updating all repos from database.`,
      err
    );
  }

  res.send("completed");
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
