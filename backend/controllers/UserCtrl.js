const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");

module.exports = {
  getWhereUsernameStartsWith: async (req, res) => {
    const { q } = req.query;
    const users = await UserModel.find(
      {
        username: {
          $regex: `${q}.*`
        }
      },
      { username: 1, _id: 0 }
    );
    const usersList = users.map(u => u.username);
    if (usersList.indexOf(req.user.username) !== -1) {
      usersList.splice(usersList.indexOf(req.user.username), 1);
    }
    res.send(usersList);
  },

  getData: async (req, res) => {
    if (req.isAuthenticated()) {
      const userRepos = await RepoModel.find({ user_id: req.user._id });
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

      res.json(dataToPlot);
    } else {
      res.status(404).send("not authenticated");
    }
  }
};
