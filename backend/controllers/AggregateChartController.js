const AggregateChart = require("../models/AggregateChart");
const ErrorHandler = require("../errors/ErrorHandler");

async function getAllForCurrentUser(req, res) {
  const userAggCharts = AggregateChart.find({ user: req.user._id }).populate(
    "repo_list"
  );
  res.json(userAggCharts);
}

async function createChart(req, res) {
  const { repo_list } = req.body;
  let aggChart;
  try {
    aggChart = await new AggregateChart({
      user: req.user._id,
      repo_list,
    }).save();
  } catch (err) {
    res.send({
      success: false,
      error: `Error creating chart.`,
    });
    ErrorHandler.logger(
      `${arguments.callee.name}: Error caught when creating new aggregateCharts.`,
      err
    );
  }

  res.send({
    aggChart,
  });
}

async function deleteChart(req, res) {
  const { chartId } = req.body;
  try {
    await AggregateChart.deleteOne({ _id: chartId });
  } catch (err) {
    res.send({
      success: false,
      error: `Error deleting chart.`,
    });
    ErrorHandler.logger(
      `${arguments.callee.name}: Error caught when deleting aggregateCharts with chartId ${chartId}.`,
      err
    );
  }

  res.send({
    msg: "Chart deleted.",
  });
}

async function updateRepoList(req, res) {
  const { chartId, repoList } = req.body;

  try {
    await AggregateChart.update(
      {
        _id: chartId,
      },
      {
        repo_list: repoList,
      }
    );
  } catch (err) {
    res.send({
      success: false,
      error: `Error updating chart.`,
    });
    ErrorHandler.logger(
      `${arguments.callee.name}: Error caught when updating aggregateCharts with chartId ${chartId}.`,
      err
    );
  }

  res.send({
    msg: "Repo added to chart.",
  });
}

module.exports = {
  getAllForCurrentUser,
  createChart,
  deleteChart,
  updateRepoList,
};
