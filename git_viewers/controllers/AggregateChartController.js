const AggregateChart = require("../models/AggregateChart");

module.exports = {
  getAllForCurrentUser: async (req, res) => {
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
    const { chartId } = req.body;
    await AggregateChart.deleteOne({ _id: chartId });

    res.send({
      msg: "Chart deleted."
    });
  },

  addRepo: async (req, res) => {
    const { chartId, repoId } = req.body;
    await AggregateChart.update(
      {
        _id: chartId
      },
      {
        repo_list: {
          $push: repoId
        }
      }
    );

    res.send({
      msg: "Repo added to chart."
    });
  }
};
