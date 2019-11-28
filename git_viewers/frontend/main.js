import chartOptions from "./chartOptions";
import "./ChartWithLine";

let repoId;
let chartIndexToEdit;
let chartIdToEdit;
const aggregateChartArray = [];
let repoIdToAdd;

function addRepoInToggleList(repo) {
  const toggleDiv = document.createElement("div");
  toggleDiv.className = "custom-control custom-switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "custom-control-input";
  input.id = repo.reponame;
  input.addEventListener("click", addRepoListener);

  const label = document.createElement("label");
  label.className = "custom-control-label";
  label.setAttribute("for", `${repo.reponame}`);
  label.innerText = repo.reponame;

  toggleDiv.appendChild(input);
  toggleDiv.appendChild(label);
  document.getElementById("fullRepoNames").appendChild(toggleDiv);
}

data.userRepos.forEach(userRepo => {
  let repo = prepareRepo(userRepo);
  addRepoInToggleList(repo);

  var ctx = document.getElementById(repo._id).getContext("2d");
  document.getElementById(repo._id).height = 100;
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "LineWithLine",

    // The data for our dataset
    data: {
      labels: repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY")),
      datasets: [
        {
          label: "Views",
          fill: false,
          backgroundColor: "#603A8B",
          borderColor: "#603A8B",
          data: repo.views.map(h => h.count)
        },
        {
          label: "Unique Views",
          fill: false,
          backgroundColor: "#FDCB00",
          borderColor: "#FDCB00",
          data: repo.views.map(h => h.uniques)
        }
      ]
    },

    // Configuration options go here
    options: chartOptions
  });
});

data.sharedRepos.forEach(sharedRepo => {
  let repo = prepareRepo(sharedRepo);
  addRepoInToggleList(repo);

  var ctx = document.getElementById(repo._id).getContext("2d");

  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "LineWithLine",

    // The data for our dataset
    data: {
      labels: repo.views.map(h => h.timestamp),
      datasets: [
        {
          label: "Unique Views",
          fill: false,
          backgroundColor: "#FDCB00",
          borderColor: "#FDCB00",
          data: repo.views.map(h => h.uniques)
        },
        {
          label: "Views",
          fill: false,
          backgroundColor: "#603A8B",
          borderColor: "#603A8B",
          data: repo.views.map(h => h.count)
        }
      ]
    },

    // Configuration options go here
    options: chartOptions
  });
});

data.aggregateCharts.forEach(aggregateChart => {
  createChartElements(aggregateChart._id);
  const c = aggregateChartArray[aggregateChartArray.length - 1];
  c.repoArray = aggregateChart.repo_list.map((repoId) => {
    const fromUserRepo = data.userRepos.filter(
      repo => repo._id === repoId
    );
    const fromSharedRepo = data.sharedRepos.filter(
      repo => repo._id === repoId
    );
  
    if (fromUserRepo.length !== 0) {
      return fromUserRepo[0];
    }
  
    if (fromSharedRepo.length !== 0) {
      return fromSharedRepo[0];
    }
  });
  chartUpdate(aggregateChartArray.length - 1);
});

function prepareRepo(repo) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);
  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);

  if (repo.views.length !== 0) {
    const first = new Date(repo.views[0].timestamp);
    const last = new Date(repo.views[repo.views.length - 1].timestamp);

    if (first.getTime() < firstTimestamp.getTime()) {
      firstTimestamp = first;
    }

    if (last.getTime() > lastTimestamp.getTime()) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  const timeIndex = firstTimestamp;

  while (timeIndex.getTime() <= lastTimestamp.getTime()) {
    if (repo.views[index] === undefined) {
      repo.views.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0
      });
    } else {
      const currentTimestamp = new Date(repo.views[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        repo.views.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return repo;
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

window.shareRepository = () => {
  const username = document.getElementById("share-with").value;

  $.ajax({
    url: "/repo/share",
    type: "POST",
    dataType: "json",
    data: "name=get_username" + "&repoId=" + repoId + "&username=" + username,
    success: function(data) {},
    error: function() {}
  });
}

window.saveChartToDatabase = async () => {
  const repoList = aggregateChartArray[chartIndexToEdit].repoArray.map(repo => {
    return repo._id;
  });

  const dataJSON = {
    chartId: chartIdToEdit,
    repoList
  };

  const updateResponse = await $.ajax({
    url: `/aggCharts/update`,
    type: `GET`,
    dataType: `application/json`,
    data: dataJSON
  });
};

function createChartElements(createdChartId) {
  const nameofChart = `chart${aggregateChartArray.length}`;

  /* Create HTML elements */
  const div = document.createElement("div");
  div.id = nameofChart;

  const rawDiv = document.createElement("div");
  rawDiv.className = "row";

  const h3 = document.createElement("h3");
  h3.innerHTML = nameofChart;
  h3.className = "repo-title";

  const allignToRight = document.createElement("div");
  allignToRight.className = "actionButtons";

  const editButton = document.createElement("button");
  editButton.setAttribute("data-target", "#editModal");
  editButton.className = "margin-8 add-btn btn btn-outline-dark";
  editButton.innerHTML = `<i class="fas fa-edit"></i>`;
  editButton.id = createdChartId;
  editButton.addEventListener("click", chartEditListener);

  const deleteButton = document.createElement("button");
  deleteButton.className = "margin-8 add-btn btn btn-outline-dark";
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.setAttribute("data-chartId", createdChartId);
  deleteButton.addEventListener("click", chartDeleteListener);

  const canv = document.createElement("canvas");
  canv.height = 100;

  rawDiv.appendChild(h3);

  allignToRight.appendChild(editButton);
  allignToRight.appendChild(deleteButton);
  rawDiv.appendChild(allignToRight);

  div.appendChild(rawDiv);
  div.appendChild(canv);
  document.getElementById("customCharts").appendChild(div);

  /* Creating the chart */
  const ctx = canv.getContext("2d");

  const chartToEdit = new Chart(ctx, {
    // The type of chart we want to create
    type: "LineWithLine",

    // Configuration options go here
    options: chartOptions
  });

  /* Local save for the new chart */
  aggregateChartArray.push({
    chartToEdit,
    repoArray: [],
    name: canv.id,
    id: createdChartId
  });

  console.log(aggregateChartArray);
}

window.addCustomChart = async () => {
  const createResponse = await $.ajax({
    url: `/aggCharts/create`,
    type: `GET`
  });

  const createdChartId = createResponse._id;
  /* Create DOM elements for chart */
  createChartElements(createdChartId);

  /* Show the modal for editing the creating chart */
  chartIdToEdit = createdChartId;
  chartIndexToEdit = aggregateChartArray.length - 1;

  const repoStates = document.querySelectorAll("#fullRepoNames input");
  for (let i = 0; i < repoStates.length; i += 1) {
    repoStates[i].checked = false;
  }

  $("#editModal").modal("show");
};

function getRepoFromData(reponame) {
  const fromUserRepo = data.userRepos.filter(
    repo => repo.reponame === reponame
  );
  const fromSharedRepo = data.sharedRepos.filter(
    repo => repo.reponame === reponame
  );

  if (fromUserRepo.length !== 0) {
    return fromUserRepo[0];
  }

  if (fromSharedRepo.length !== 0) {
    return fromSharedRepo[0];
  }
  return undefined;
}

function removeFromAggregateChart(chartIndex, reponame) {
  for (let i = 0; i < aggregateChartArray.length; i += 1) {
    for (let j = 0; j < aggregateChartArray[i].repoArray.length; j += 1) {
      if (aggregateChartArray[i].repoArray[j].reponame === reponame) {
        aggregateChartArray[i].repoArray.splice(j, 1);

        break;
      }
    }
  }

  chartUpdate(chartIndex);
}

function aggregateTwoCharts(chartIndex, reponame) {
  /* Searching in data for the repo */
  const repoToAdd = getRepoFromData(reponame);

  /* Add the repo to the chart structure */
  aggregateChartArray[chartIndex].repoArray.push(repoToAdd);
  chartUpdate(chartIndex);
}

function chartUpdate(index) {
  aggregateChartArray[index].chartToEdit.data.labels = [];
  aggregateChartArray[index].chartToEdit.data.datasets = [];

  if (aggregateChartArray[index].repoArray.length === 0) {
    aggregateChartArray[index].chartToEdit.update();
    return;
  }

  /* Find the repo wih the oldest timestamp */
  if (aggregateChartArray[index].repoArray.length === 0) {
    return;
  }

  let repoWithMinTimestamp = aggregateChartArray[index].repoArray[0];
  console.log(repoWithMinTimestamp);

  aggregateChartArray[index].repoArray.forEach(repo => {
    const minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);
    const repoStartDate = new Date(repo.views[0].timestamp);

    if (repoStartDate.getTime() < minStartDate.getTime()) {
      repoWithMinTimestamp = repo;
    }
  });

  /* Get the oldest date */
  const startDate = new Date(repoWithMinTimestamp.views[0].timestamp);

  /* Adding dummy data to all repos to start from the oldest date */
  aggregateChartArray[index].repoArray.map(repo => {
    const repoStartDate = new Date(repo.views[0].timestamp);

    const days =
      Math.abs(repoStartDate.getTime() - startDate.getTime()) /
      (1000 * 3600 * 24);

    if (days !== 0) {
      const time = new Date(repoWithMinTimestamp.views[0].timestamp);
      for (let i = 0; i < days; i += 1) {
        repo.views.splice(i, 0, {
          timestamp: time.toISOString(),
          count: 0,
          uniques: 0
        });
        time.setUTCDate(time.getUTCDate() + 1);
      }
    }
  });

  aggregateChartArray[
    index
  ].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h =>
    moment(h.timestamp).format("DD MMM YYYY")
  );

  aggregateChartArray[index].repoArray.forEach(repo => {
    const uvColor =
        "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
      vColor =
        "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
    aggregateChartArray[index].chartToEdit.data.datasets.push({
      label: `${repo.reponame.split("/")[1]} - Unique Views`,
      fill: false,
      backgroundColor: uvColor,
      borderColor: uvColor,
      data: repo.views.map(h => h.uniques)
    });

    aggregateChartArray[index].chartToEdit.data.datasets.push({
      label: `${repo.reponame.split("/")[1]} - Views`,
      fill: false,
      backgroundColor: vColor,
      borderColor: vColor,
      data: repo.views.map(h => h.count)
    });
  });

  aggregateChartArray[index].chartToEdit.update();
}

jQuery(function() {
  $("button.share-btn").on("click", function() {
    repoId = $(this).attr("data-repoId");
  });
});

async function chartDeleteListener(e) {
  const button = e.currentTarget;
  const chartId = button.getAttribute("data-chartId");
  console.log(chartId);

  /* Remove from HTML Page*/
  let chartToRemove = button.parentElement.parentElement.parentElement;
  chartToRemove.parentElement.removeChild(chartToRemove);

  /* Remove from aggregateChartArray */
  
  /* Remove from database */
  const deleteResponse = await $.ajax({
    url: `/aggCharts/delete`,
    type: `GET`,
    dataType: `application/json`,
    data: { chartId }
  });
}

function addRepoListener(e) {
  const reponameToAdd = e.currentTarget.id;
  if (e.currentTarget.checked) {
    aggregateTwoCharts(chartIndexToEdit, reponameToAdd);
  } else {
    removeFromAggregateChart(chartIndexToEdit, reponameToAdd);
  }
}

function chartEditListener(e) {
  chartIdToEdit = e.currentTarget.id;

  for (let i = 0; i < aggregateChartArray.length; i += 1) {
    if (aggregateChartArray[i].id === chartIdToEdit) {
      chartIndexToEdit = i;
      break;
    }
  }

  const aggregateChart = aggregateChartArray[chartIndexToEdit];
  const repoStates = document.querySelectorAll("#fullRepoNames input");

  for (let i = 0; i < repoStates.length; i += 1) {
    repoStates[i].checked = false;

    for (let j = 0; j < aggregateChart.repoArray.length; j += 1) {
      if (aggregateChart.repoArray[j].reponame === repoStates[i].id) {
        repoStates[i].checked = true;
      }
    }
  }

  $("#editModal").modal("show");
}
