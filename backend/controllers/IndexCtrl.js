const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");

module.exports = {
  home: async (req, res) => {
    if (req.isAuthenticated()) {
      const userRepos = await RepoModel.find({ users: { $eq: req.user._id } });
      const { sharedRepos, githubId } = await UserModel.findById(
        req.user._id
      ).populate("sharedRepos");
      const aggregateCharts = await AggregateChartModel.find({
        user: req.user._id
      });
      const dataToPlot = {
        userRepos,
        sharedRepos,
        aggregateCharts,
        githubId
      };

      res.render("account", { user: req.user, data: dataToPlot });
    } else {
      res.render("index");
    }
  }
};
