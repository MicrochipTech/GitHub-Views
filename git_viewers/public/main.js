var repoId = null;
var chartIndexToEdit = undefined;

chartOptions = {
  tooltips: {
    intersect: false,
    mode: 'label',
    position: 'nearPointer',
  },
  scales: {
    xAxes: [{
      ticks: {
        autoSkip: true,
        maxTicksLimit: 8
      }
    }],
  },
  elements: {
    line: {
      tension: 0
    }
  }
}

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
   draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
         var activePoint = this.chart.tooltip._active[0],
             ctx = this.chart.ctx,
             x = activePoint.tooltipPosition().x,
             topY = this.chart.scales['y-axis-0'].top,
             bottomY = this.chart.scales['y-axis-0'].bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 1;
         ctx.strokeStyle = '#555';
         ctx.stroke();
         ctx.restore();
      }
   }
});

Chart.Tooltip.positioners.nearPointer = function(elements, eventPosition) {
    var tooltip = this;

    return {
        x: eventPosition.x,
        y: eventPosition.y
    };
};

function addRepoInToggleList(repo) {
  let toggleDiv = document.createElement('div');
  toggleDiv.className = 'custom-control custom-switch';

  let input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'custom-control-input';
  input.id = repo.reponame;
  input.addEventListener('click', addRepoListener);

  let label = document.createElement('label');
  label.className = 'custom-control-label';
  label.setAttribute('for', `${repo.reponame}`);
  label.innerText = repo.reponame;

  toggleDiv.appendChild(input);
  toggleDiv.appendChild(label);
  document.getElementById('fullRepoNames').appendChild(toggleDiv);
}

data.userRepos.forEach(userRepo => {
  let repo = prepareRepo(userRepo);
  addRepoInToggleList(repo);

  var ctx = document.getElementById(repo._id).getContext('2d');
  document.getElementById(repo._id).height = 100;
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'LineWithLine',

      // The data for our dataset
      data: {
          labels: repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY")),
          datasets: [{
              label: 'Views',
              fill: false,
              backgroundColor: '#603A8B',
              borderColor: '#603A8B',
              data: repo.views.map(h=>h.count),
          },{
              label: 'Unique Views',
              fill: false,
              backgroundColor: '#FDCB00',
              borderColor: '#FDCB00',
              data: repo.views.map(h=>h.uniques),
          }]
      },

      // Configuration options go here
      options: chartOptions
  });
});

data.sharedRepos.forEach(sharedRepo => {
  let repo = prepareRepo(sharedRepo);
  addRepoInToggleList(repo);

  var ctx = document.getElementById(repo._id).getContext('2d');

  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'LineWithLine',

      // The data for our dataset
      data: {
          labels: repo.views.map(h=>h.timestamp),
          datasets: [{
              label: 'Unique Views',
              backgroundColor: 'rgb(0,0,0, 0)',
              borderColor: '#FDCB00',
              data: repo.views.map(h=>h.uniques),
          }, {
              label: 'Views',
              backgroundColor: 'rgb(0,0,0, 0)',
              borderColor: '#603A8B',
              data: repo.views.map(h=>h.count),
          }]
      },

      // Configuration options go here
      options: chartOptions
  });
});

function prepareRepo(repo) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);
  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);

  if (repo.views.length != 0) {
    let first = new Date(repo.views[0].timestamp);
    let last = new Date(repo.views[repo.views.length - 1].timestamp);

    if (first.getTime() < firstTimestamp.getTime()) {
      firstTimestamp = first;
    }

    if (last.getTime() > lastTimestamp.getTime()) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  let timeIndex = firstTimestamp;

  while (timeIndex.getTime() <= lastTimestamp.getTime()) {
    if (repo.views[index] === undefined) {
      repo.views.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0,
      });
    } else {
      currentTimestamp = new Date(repo.views[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        repo.views.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0,
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return repo;
}

function divSwitcher(e) {
  var elements = e.parentElement.children;

  for (var i = 0; i < elements.length; i++) {
    if(elements[i] == e) {
      elements[i].style.display = 'block';
    } else {
      elements[i].style.display = 'none';
    }
  }
}

function shareRepository() {
  username = document.getElementById('share-with').value;

  $.ajax({
    url: '/repo/share',
    type: 'POST',
    dataType: 'json',
    data: "name=get_username" + "&repoId=" + repoId + "&username=" + username,
    success: function (data) {

    },
    error: function () {

    }
  })
}

aggregateChartArray = [];
repoIdToAdd = undefined;

function addCustomChart() {
  var nameofChart = 'chart' + aggregateChartArray.length;

  /* Create HTML elements */
  var div = document.createElement('div');
  div.id = nameofChart;

  var rawDiv = document.createElement('div');
  rawDiv.className = 'row';

  var h3 = document.createElement('h3');
  h3.innerHTML = nameofChart;
  h3.className = 'repo-title';

  var allignToRight = document.createElement('div');
  allignToRight.className = 'actionButtons';

  var editButton = document.createElement('button');
  editButton.setAttribute('data-target', '#editModal');
  editButton.className = 'margin-8 add-btn btn btn-outline-dark';
  editButton.innerHTML = `<i class="fas fa-edit"></i>`;
  editButton.id = aggregateChartArray.length;
  editButton.addEventListener('click', chartEditListener);

  var deleteButton = document.createElement('button');
  deleteButton.className = 'margin-8 add-btn btn btn-outline-dark';
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.addEventListener('click', chartDeleteListener);

  var canv = document.createElement('canvas');
  canv.height = 100;

  rawDiv.appendChild(h3);

  allignToRight.appendChild(editButton);
  allignToRight.appendChild(deleteButton);
  rawDiv.appendChild(allignToRight);

  div.appendChild(rawDiv);
  div.appendChild(canv);
  document.getElementById('customCharts').appendChild(div);

  /* Creating the chart */
  var ctx = canv.getContext('2d');

  chartToEdit = new Chart(ctx, {
      // The type of chart we want to create
      type: 'LineWithLine',

      // Configuration options go here
      options: chartOptions
  });

  /* Local save for the new chart */
  aggregateChartArray.push({
    chartToEdit: chartToEdit,
    repoArray: [],
    name: canv.id
  });

  /* Show the modal for editing the creating chart */
  chartIndexToEdit = aggregateChartArray.length - 1;

  let repoStates = document.querySelectorAll('#fullRepoNames input');
  for (var i = 0; i < repoStates.length; i++) {
    repoStates[i].checked = false;
  }

  $('#editModal').modal('show');
}

function getRepoFromData(reponame) {
  fromUserRepo = data.userRepos.filter(repo => (repo.reponame == reponame));
  fromSharedRepo = data.sharedRepos.filter(repo => (repo.reponame == reponame));

  if(fromUserRepo.length != 0) {
    return fromUserRepo[0];
  }

  if(fromSharedRepo.length != 0) {
    return fromSharedRepo[0];
  }
}

function removeFromAggregateChart(chartIndex, reponame) {
  for(var i = 0; i < aggregateChartArray.length; ++i) {
    for(var j = 0; j < aggregateChartArray[i].repoArray.length; ++j) {
      if(aggregateChartArray[i].repoArray[j].reponame == reponame) {

        aggregateChartArray[i].repoArray.splice(j, 1);

        break;
      }
    }
  }

  chartUpdate(chartIndex);
}

function aggregateTwoCharts(chartIndex, reponame) {
  /* Searching in data for the repo */
  repoToAdd = getRepoFromData(reponame);

  /* Add the repo to the chart structure */
  aggregateChartArray[chartIndex].repoArray.push(repoToAdd);
  chartUpdate(chartIndex);
}

function chartUpdate(index) {

  aggregateChartArray[index].chartToEdit.data.labels = [];
  aggregateChartArray[index].chartToEdit.data.datasets = [];

  if(aggregateChartArray[index].repoArray.length == 0) {
    aggregateChartArray[index].chartToEdit.update();
    return;
  }

  /* Find the repo wih the oldest timestamp */
  repoWithMinTimestamp = aggregateChartArray[index].repoArray[0];

  aggregateChartArray[index].repoArray.forEach(repo => {
    let minStartDate = new Date(repoWithMinTimestamp.views[0].timestamp);
    let repoStartDate = new Date(repo.views[0].timestamp);

    if(repoStartDate.getTime() < minStartDate.getTime()) {
      repoWithMinTimestamp = repo;
    }
  });

  /* Get the oldest date */
  startDate = new Date(repoWithMinTimestamp.views[0].timestamp);

  /* Adding dummy data to all repos to start from the oldest date */
  aggregateChartArray[index].repoArray.map(repo => {

    let repoStartDate = new Date(repo.views[0].timestamp);

    days = Math.abs(repoStartDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

    if(days != 0) {
      var time = new Date(repoWithMinTimestamp.views[0].timestamp);
      for(var index = 0; index < days; ++index) {
        repo.views.splice(index, 0, { timestamp: time.toISOString(), count: 0, uniques: 0});
        time.setUTCDate(time.getUTCDate() + 1);
      }
    }
  });

  aggregateChartArray[index].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));

  aggregateChartArray[index].repoArray.forEach(repo => {
    aggregateChartArray[index].chartToEdit.data.datasets.push({
                                      label: 'Unique Views (' + repo.reponame + ')',
                                      backgroundColor: 'rgb(0,0,0, 0)',
                                      borderColor: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),
                                      data: repo.views.map(h=>h.uniques),
                                    });

    aggregateChartArray[index].chartToEdit.data.datasets.push({
                                      label: 'Views (' + repo.reponame + ')',
                                      backgroundColor: 'rgb(0,0,0, 0)',
                                      borderColor: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),
                                      data: repo.views.map(h=>h.count),
                                    });
  });

  aggregateChartArray[index].chartToEdit.update();
}

jQuery(function(){
  $("button.share-btn").on("click", function(){
    repoId = $(this).attr("data-repoId");
  })
});

function chartDeleteListener(e) {
  console.log("TODO DELETEING");
  button = e.currentTarget;

  /* Remove from database */

  /* Remove from HTML Page*/

  /* Remove from aggregateChartArray */
}

function addRepoListener(e) {
  reponameToAdd = e.currentTarget.id;
  if (e.currentTarget.checked) {
    aggregateTwoCharts(chartIndexToEdit, reponameToAdd);
  } else {
    removeFromAggregateChart(chartIndexToEdit, reponameToAdd);
  }
}

function chartEditListener(e) {
  chartIndexToEdit  = e.currentTarget.id;
  let aggregateChart = aggregateChartArray[chartIndexToEdit];

  let repoStates = document.querySelectorAll('#fullRepoNames input');
  for (var i = 0; i < repoStates.length; i++) {
    repoStates[i].checked = false;

    for(var j = 0; j < aggregateChart.repoArray.length; j += 1) {
      if(aggregateChart.repoArray[j].reponame == repoStates[i].id) {
        repoStates[i].checked = true;
      }
    }
  }

  $('#editModal').modal('show');
}
