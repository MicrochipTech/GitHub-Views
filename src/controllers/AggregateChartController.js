const AggregateChart = require("../models/AggregateChart");

module.exports = {
  getAllForCurrentUser: async (req, res) => {
    const userAggCharts = AggregateChart.find({ user: req.user._id }).populate(
      "repo_list"
    );
    res.json(userAggCharts);
  },

  create: async (req, res) => {
    const { repo_list } = req.body;
    const aggChart = await new AggregateChart({
      user: req.user._id,
      repo_list
    }).save();

    res.send({
      aggChart
    });
  },

  delete: async (req, res) => {
    const { chartId } = req.body;
    await AggregateChart.deleteOne({ _id: chartId });

    res.send({
      msg: "Chart deleted."
    });
  },

  updateRepoList: async (req, res) => {
    const { chartId, repoList } = req.body;

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
