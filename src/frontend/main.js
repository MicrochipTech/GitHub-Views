import "./ChartWithLine";
import { addRepoInToggleList, prepareRepo } from "./repo";
import { createChart, createChartElements, chartUpdate } from "./chart";

window.aggregateChartArray = [];
window.repoIdToShare = undefined;
window.chartIndexToEdit = undefined;
window.chartIdToEdit = undefined;

const maximumTimetamp = new Date();
maximumTimetamp.setUTCHours(0, 0, 0, 0);
maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

let minimumTimetamp = new Date();
minimumTimetamp.setUTCHours(0, 0, 0, 0);
minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

if (data.userRepos) {
  data.userRepos.forEach(userRepo => {
    if (userRepo.views.length != 0) {
      let firstRepoTimestamp = new Date(userRepo.views[0].timestamp);

      if (firstRepoTimestamp < minimumTimetamp) {
        minimumTimetamp = firstRepoTimestamp;
      }
    }
  });
}

if (data.sharedRepos) {
  data.sharedRepos.forEach(sharedRepo => {
    if (sharedRepo.views.length != 0) {
      let firstRepoTimestamp = new Date(sharedRepo.views[0].timestamp);

      if (firstRepoTimestamp < minimumTimetamp) {
        minimumTimetamp = firstRepoTimestamp;
      }
    }
  });
}

let tableHead = ["reponame", "type"];
let timeIndex = new Date(minimumTimetamp.getTime());
const dates = [];

while (timeIndex.getTime() <= maximumTimetamp.getTime()) {

  dates.push(moment(timeIndex).format("DD MMM YYYY"));

  timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
}

tableHead = tableHead.concat(dates);

//dates.reduce()

//console.log(dates);

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

function compareDate(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  if(date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()) {
        return true;
      }
  
  return false;
}

function searchDate(dateArr, d1) {
  for(let index = 2; index < dateArr.length; ++index) {
    if(compareDate(dateArr[index], d1))
      return true;
  }

  return false;
}

function reducer(total, currentValue, currentIndex) {
  if (currentIndex > 1) {
    if(searchDate(total, currentValue) === false) {
      total.push(currentValue);
    }
  }
  return total;
}

const reducerHof = th => (total, currentValue, currentIndex) => {
  if (currentIndex > 1) {
    let acc = total.pop();

    if(currentIndex == 2 || compareDate(th[currentIndex], th[currentIndex - 1]) === false) {
      //console.log(th[currentIndex]);
      total.push(acc);
      acc = [th[currentIndex], 0];
    }

    acc[1] += currentValue;
    total.push(acc);
  }

  return total;
}

let rowsMapReduced = rows.map((element, index) => {
  if(index == 0) {
    let months = element.reduce(reducer, [element[0], element[1]]);
    months = months.map((innerE, innerI) => {
      
      if(innerI > 1) {
        console.log(innerE);
        return moment(innerE).format("MMM YYYY");
      }
      return innerE;
    });
    
    return months;
  } else {
    let reducedCounts = element.reduce(reducerHof(rows[0]), [element[0], element[1]]);
    
    reducedCounts = reducedCounts.map((innerE, innerI) => {
      if(innerI > 1) {
        return innerE[1];
      }

      return innerE;
    });
    return reducedCounts;
  }
});

console.log(rowsMapReduced);

window.monthExportListener = () => {
  console.log("ASD");
  let csvContent = "data:text/csv;charset=utf-8," 
    + rowsMapReduced.map(e => e.join(",")).join("\n");

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "monthlyRepoTraffic.csv");
  document.body.appendChild(link);

  link.click();
}

window.dayExportListener = () => {
  let csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "dailyRepoTraffic.csv");
  document.body.appendChild(link);

  link.click();
}



window.syncListener = async () => {
  await $.ajax({
    url: `/repo/sync`,
    type: `GET`
  });

  window.location.reload();
};

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
