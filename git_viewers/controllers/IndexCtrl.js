const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel= require("../models/AggregateChart");

module.exports = {
  home: async (req, res) => {
    if (req.user) {
      const userRepos = await RepoModel.find({ user_id: req.user._id });
      const user = await UserModel.findById(req.user._id).populate(
        "sharedRepos"
      );
      const aggregateCharts = await AggregateChartModel.find({
        user: req.user._id 
      });

      const dataToPlot = {
        userRepos,
        sharedRepos: user.sharedRepos,
        aggregateCharts
      };

      res.render("account", { user: req.user, data: dataToPlot });
    } else {
      res.render("index");
    }
  }
};
