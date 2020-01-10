import { aggregateTwoCharts, removeFromAggregateChart } from "./chart";

window.repoShareListener = e => {
  window.repoIdToShare = e.getAttribute("data-repoId");
};

async function chartDeleteListener(e) {
  const button = e.currentTarget;
  const chartId = button.getAttribute("data-chartId");

  /* Remove from HTML Page */
  const chartToRemove = button.parentElement.parentElement.parentElement;
  chartToRemove.parentElement.removeChild(chartToRemove);

  /* Remove from aggregateChartArray */

  /* Remove from database */
  try {
    await $.ajax({
      url: `/aggCharts/delete`,
      type: `GET`,
      dataType: `application/json`,
      data: { chartId }
    });
  } catch (error) {
    console.log(error);
  }
}

function addRepoListener(e) {
  const reponameToAdd = e.currentTarget.id;
  if (e.currentTarget.checked) {
    aggregateTwoCharts(window.chartIndexToEdit, reponameToAdd);
  } else {
    removeFromAggregateChart(window.chartIndexToEdit, reponameToAdd);
  }
}

function chartEditListener(e) {
  window.chartIdToEdit = e.currentTarget.id;

  for (let i = 0; i < window.aggregateChartArray.length; i += 1) {
    if (window.aggregateChartArray[i].id === window.chartIdToEdit) {
      window.chartIndexToEdit = i;
      break;
    }
  }

  const aggregateChart = window.aggregateChartArray[window.chartIndexToEdit];
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

export { chartDeleteListener, addRepoListener, chartEditListener };
