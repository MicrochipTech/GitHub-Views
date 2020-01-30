import "./ChartWithLine";
import { addRepoInToggleList, prepareRepo } from "./repo";
import { createChart, createChartElements, chartUpdate } from "./chart";

window.aggregateChartArray = [];
window.repoIdToShare = undefined;
window.chartIndexToEdit = undefined;
window.chartIdToEdit = undefined;

let maximumTimetamp = new Date();
maximumTimetamp.setUTCHours(0, 0, 0, 0);
maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

let minimumTimetamp = new Date();
minimumTimetamp.setUTCHours(0, 0, 0, 0);
minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

if (data.userRepos) {
  data.userRepos.forEach(userRepo => {
      if(userRepo.views.length != 0) {
      let firstRepoTimestamp = new Date(userRepo.views[0].timestamp);
    
      if (firstRepoTimestamp < minimumTimetamp) {
        minimumTimetamp = firstRepoTimestamp;
      }
    }
  });
}

if (data.sharedRepos) {
  data.sharedRepos.forEach(sharedRepo => {
    if(sharedRepo.views.length != 0) {
      let firstRepoTimestamp = new Date(sharedRepo.views[0].timestamp);
    
      if (firstRepoTimestamp < minimumTimetamp) {
        minimumTimetamp = firstRepoTimestamp;
      }
    }
  });
}

const tableHead = ["reponame", "type"];
let timeIndex = new Date(minimumTimetamp.getTime());

while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
  
  tableHead.push(moment(timeIndex).format("DD MMM YYYY"));

  timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
}

const rows = [tableHead];

if (data.userRepos) {
  data.userRepos.forEach(userRepo => {

    const repo = prepareRepo(userRepo);
    addRepoInToggleList(repo);

    let viewsCSV = [repo.reponame, "views"];
    let uniquesCSV = [repo.reponame, "uniques"];

    const limitTimestamp = new Date(repo.views[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {

      viewsCSV.push(0);
      uniquesCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const labels = repo.views.map(h =>
      moment(h.timestamp).format("DD MMM YYYY")
    );
    const views = repo.views.map(h => h.count);
    const uniques = repo.views.map(h => h.uniques);

    viewsCSV = viewsCSV.concat(views);
    uniquesCSV = uniquesCSV.concat(uniques);
    rows.push(viewsCSV);
    rows.push(uniquesCSV);

    const ctx = document.getElementById(repo._id).getContext("2d");
    document.getElementById(repo._id).height = 100;
      
    createChart(ctx, labels, views, uniques);
  });
}

if (data.sharedRepos) {

  data.sharedRepos.forEach(sharedRepo => {

    const repo = prepareRepo(sharedRepo);
    addRepoInToggleList(repo);

    let viewsCSV = [repo.reponame, "views"];
    let uniquesCSV = [repo.reponame, "uniques"];

    const limitTimestamp = new Date(repo.views[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {

      viewsCSV.push(0);
      uniquesCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const labels = repo.views.map(h =>
      moment(h.timestamp).format("DD MMM YYYY")
    );
    const views = repo.views.map(h => h.count);
    const uniques = repo.views.map(h => h.uniques);

    viewsCSV = viewsCSV.concat(views);
    uniquesCSV = uniquesCSV.concat(uniques);
    rows.push(viewsCSV);
    rows.push(uniquesCSV);

    const ctx = document.getElementById(repo._id).getContext("2d");
    document.getElementById(repo._id).height = 100;

    createChart(ctx, labels, views, uniques);
  });
}

if (data.aggregateCharts) {
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
}

window.exportListener = () => {
  let csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "repoTraffic.csv");
    document.body.appendChild(link);

    link.click();
}

window.syncListener = async () => {
  await $.ajax({
    url: `/repo/sync`,
    type: `GET`
  });

  window.location.reload();
}

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

window.onerror = (msg, url, lineNo, columnNo, error) => {
  const string = msg.toLowerCase();
  const substring = "script error";
  if (string.indexOf(substring) > -1) {
    console.log("Script Error.");
  } else {
    const message = [
      `Message: ${msg}`,
      `URL: ${url}`,
      `Line: ${lineNo}`,
      `Column: ${columnNo}`,
      `Error object: ${JSON.stringify(error)}`
    ].join(" - ");

    console.log(message);
  }

  return false;
};
