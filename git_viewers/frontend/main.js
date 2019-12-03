import "./ChartWithLine";
import { addRepoInToggleList, prepareRepo } from "./repo";
import { createChart, createChartElements, chartUpdate } from "./chart";

window.aggregateChartArray = [];
window.repoIdToShare = undefined;
window.chartIndexToEdit = undefined;
window.chartIdToEdit = undefined;

data.userRepos.forEach(userRepo => {
  const repo = prepareRepo(userRepo);
  addRepoInToggleList(repo);

  const labels = repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));
  const views = repo.views.map(h => h.count);
  const uniques = repo.views.map(h => h.uniques);
  const ctx = document.getElementById(repo._id).getContext("2d");
  document.getElementById(repo._id).height = 100;

  createChart(ctx, labels, views, uniques);
});

data.sharedRepos.forEach(sharedRepo => {
  const repo = prepareRepo(sharedRepo);
  addRepoInToggleList(repo);

  const labels = repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));
  const views = repo.views.map(h => h.count);
  const uniques = repo.views.map(h => h.uniques);
  const ctx = document.getElementById(repo._id).getContext("2d");
  document.getElementById(repo._id).height = 100;

  createChart(ctx, labels, views, uniques);
});

data.aggregateCharts.forEach(aggregateChart => {
  createChartElements(aggregateChart._id);
  const c = window.aggregateChartArray[window.aggregateChartArray.length - 1];

  if (aggregateChart.repo_list) {
    c.repoArray = aggregateChart.repo_list.map(repoId => {
      const fromUserRepo = data.userRepos.filter(repo => repo._id === repoId);
      const fromSharedRepo = data.sharedRepos.filter(
        repo => repo._id === repoId
      );

      if (fromUserRepo.length !== 0) {
        return fromUserRepo[0];
      }
      if (fromSharedRepo.length !== 0) {
        return fromSharedRepo[0];
      }
      return undefined;
    });
  }

  chartUpdate(window.aggregateChartArray.length - 1);
});

window.divSwitcher = e => {
  const elements = e.parentElement.children;

  for (let i = 0; i < elements.length; i += 1) {
    if (elements[i] === e) {
      elements[i].style.display = "block";
    } else {
      elements[i].style.display = "none";
    }
  }
};
