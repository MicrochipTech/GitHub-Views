const AggregateChart = require("../models/AggregateChart");

module.exports = {
  getAllForCurrentUser: async (req, res) => {
    console.log("USER : " + req.user._id);
    const userAggCharts = AggregateChart.find({ user: req.user._id }).populate(
      "repo_list"
    );
    res.json(userAggCharts);
  },

  create: async (req, res) => {
    const aggChart = await new AggregateChart({
      user: req.user._id
    }).save();

    res.send({
      _id: aggChart._id
    });
  },

  delete: async (req, res) => {
    const { chartId } = req.query;
    await AggregateChart.deleteOne({ _id: chartId });

    res.send({
      msg: "Chart deleted."
    });
  },

  updateRepoList: async (req, res) => {
    const { chartId, repoList } = req.query;

    await AggregateChart.update(
      {
        _id: chartId
      },
      {
        repo_list: repoList
      }
    );

    res.send({
      msg: "Repo added to chart."
    });
  }
};
