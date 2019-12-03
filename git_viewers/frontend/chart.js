import chartOptions from "./chartOptions";
import { getRepoFromData } from "./repo";
import { chartDeleteListener, chartEditListener } from "./listeners";

function generateRandomColour() {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;
}

function createChart(ctx, labels, views, uniques) {
  /* eslint-disable no-new */
  new Chart(ctx, {
    /* The type of chart we want to create */
    type: "LineWithLine",

    /* The data for our dataset */
    data: {
      labels,
      datasets: [
        {
          label: "Views",
          fill: false,
          backgroundColor: "#603A8B",
          borderColor: "#603A8B",
          data: views
        },
        {
          label: "Unique Views",
          fill: false,
          backgroundColor: "#FDCB00",
          borderColor: "#FDCB00",
          data: uniques
        }
      ]
    },

    /* Configuration options go here */
    options: chartOptions
  });
}

function createChartElements(createdChartId) {
  const nameofChart = `chart${window.aggregateChartArray.length}`;

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
  window.aggregateChartArray.push({
    chartToEdit,
    repoArray: [],
    name: canv.id,
    id: createdChartId
  });
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
  window.chartIdToEdit = createdChartId;
  window.chartIndexToEdit = window.aggregateChartArray.length - 1;

  const repoStates = document.querySelectorAll("#fullRepoNames input");
  for (let i = 0; i < repoStates.length; i += 1) {
    repoStates[i].checked = false;
  }

  $("#editModal").modal("show");
};

function chartUpdate(index) {
  window.aggregateChartArray[index].chartToEdit.data.labels = [];
  window.aggregateChartArray[index].chartToEdit.data.datasets = [];

  if (window.aggregateChartArray[index].repoArray.length === 0) {
    window.aggregateChartArray[index].chartToEdit.update();
    return;
  }

  /* Find the repo wih the oldest timestamp */
  if (window.aggregateChartArray[index].repoArray.length === 0) {
    return;
  }

  let repoWithMinTimestamp = window.aggregateChartArray[index].repoArray[0];

  window.aggregateChartArray[index].repoArray.forEach(repo => {
    const minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);
    const repoStartDate = new Date(repo.views[0].timestamp);

    if (repoStartDate.getTime() < minStartDate.getTime()) {
      repoWithMinTimestamp = repo;
    }
  });

  /* Get the oldest date */
  const startDate = new Date(repoWithMinTimestamp.views[0].timestamp);

  /* Adding dummy data to all repos to start from the oldest date */
  window.aggregateChartArray[index].repoArray.map(repo => {
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

    return undefined;
  });

  window.aggregateChartArray[
    index
  ].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h =>
    moment(h.timestamp).format("DD MMM YYYY")
  );

  window.aggregateChartArray[index].repoArray.forEach(repo => {
    const uvColor = generateRandomColour();
    const vColor = generateRandomColour();

    window.aggregateChartArray[index].chartToEdit.data.datasets.push({
      label: `${repo.reponame.split("/")[1]} - Unique Views`,
      fill: false,
      backgroundColor: uvColor,
      borderColor: uvColor,
      data: repo.views.map(h => h.uniques)
    });

    window.aggregateChartArray[index].chartToEdit.data.datasets.push({
      label: `${repo.reponame.split("/")[1]} - Views`,
      fill: false,
      backgroundColor: vColor,
      borderColor: vColor,
      data: repo.views.map(h => h.count)
    });
  });

  window.aggregateChartArray[index].chartToEdit.update();
}

window.saveChartToDatabase = async () => {
  const repoList = window.aggregateChartArray[
    window.chartIndexToEdit
  ].repoArray.map(repo => {
    return repo._id;
  });

  const dataJSON = {
    chartId: window.chartIdToEdit,
    repoList
  };

  await $.ajax({
    url: `/aggCharts/update`,
    type: `GET`,
    dataType: `application/json`,
    data: dataJSON
  });
};

function removeFromAggregateChart(chartIndex, reponame) {
  for (let i = 0; i < window.aggregateChartArray.length; i += 1) {
    for (
      let j = 0;
      j < window.aggregateChartArray[i].repoArray.length;
      j += 1
    ) {
      if (window.aggregateChartArray[i].repoArray[j].reponame === reponame) {
        window.aggregateChartArray[i].repoArray.splice(j, 1);

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
  window.aggregateChartArray[chartIndex].repoArray.push(repoToAdd);
  chartUpdate(chartIndex);
}

export {
  createChart,
  createChartElements,
  removeFromAggregateChart,
  aggregateTwoCharts,
  chartUpdate
};
