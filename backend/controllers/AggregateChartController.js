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
    let aggChart;
    try {
      aggChart = await new AggregateChart({
        user: req.user._id,
        repo_list
      }).save();
    } catch(err) {
      // TODO
    }

    res.send({
      aggChart
    });
  },

  delete: async (req, res) => {
    const { chartId } = req.body;
    try {
      await AggregateChart.deleteOne({ _id: chartId });
    } catch(err) {
      // TODO
    }

    res.send({
      msg: "Chart deleted."
    });
  },

  updateRepoList: async (req, res) => {
    const { chartId, repoList } = req.body;

    try {
      await AggregateChart.update(
        {
          _id: chartId
        },
        {
          repo_list: repoList
        }
      );
    } catch(err) {
      // TODO
    }

    res.send({
      msg: "Repo added to chart."
    });
  }
};
