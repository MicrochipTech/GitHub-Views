var repoId = null;

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

data.userRepos.forEach(userRepo => {
  //console.log(userRepo);
  let repo = prepareRepo(userRepo);
  //console.log(repo);
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
  //console.log(chart);
});

data.sharedRepos.forEach(sharedRepo => {
  let repo = prepareRepo(sharedRepo);
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
  firstTimestamp.setHours(0, 0, 0, 0);
  firstTimestamp.setDate(firstTimestamp.getDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setHours(0, 0, 0, 0);
  lastTimestamp.setDate(lastTimestamp.getDate() - 1);

  if (repo.views.length != 0) {
    let first = new Date(repo.views[0].timestamp);
    let last = new Date(repo.views[repo.views.length - 1].timestamp);

    if (first < firstTimestamp) {
      firstTimestamp = first;
    }

    if (last > lastTimestamp) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  let timeIndex = firstTimestamp;
  
  while (timeIndex <= lastTimestamp) {
    if (repo.views[index] === undefined) {
      repo.views.push({
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0,
      });
    } else if (timeIndex.getDate() < new Date(repo.views[index].timestamp).getDate()) {
      repo.views.splice(index, 0, {
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0,
      });
    }
    
    index += 1;
    timeIndex.setDate(timeIndex.getDate() + 1);
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

  /* Create a button in modal */
  button = document.createElement('button');
  button.innerText = nameofChart;
  button.className = "chart-btn btn btn-outline-dark";
  button.type = "button";
  button.id = aggregateChartArray.length;
  button.addEventListener('click', chartButtonListener);
  document.getElementById('modalChartList').appendChild(button);

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

  var deleteButton = document.createElement('button');
  deleteButton.className = 'margin-8 add-btn btn btn-outline-dark';
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.addEventListener('click', chartDeleteListener);

  var canv = document.createElement('canvas');
  canv.height = 100;

  rawDiv.appendChild(h3);

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
}

function getRepoFromData(repoId) {
  fromUserRepo = data.userRepos.filter(repo => (repo._id == repoId));
  fromSharedRepo = data.sharedRepos.filter(repo => (repo._id == repoId));
  
  if(fromUserRepo.length != 0) {
    return fromUserRepo[0];
  }

  if(fromSharedRepo.length != 0) {
    return fromSharedRepo[0];
  }
}

function removeFromAggregateChart(chartIndex, repoId) {
  for(var i = 0; i < aggregateChartArray.length; ++i) {
    for(var j = 0; j < aggregateChartArray[i].repoArray.length; ++j) {
      if(aggregateChartArray[i].repoArray[j]._id == repoId) {
        
        aggregateChartArray[i].repoArray.splice(j, 1);

        break;
      }
    }
  }

  chartUpdate(chartIndex);
}

function aggregateTwoCharts(chartIndex, repoId) {
  /* Searching in data for the repo */
  repoToAdd = getRepoFromData(repoId);

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
    if(new Date(repo.views[0].timestamp) < new Date(repoWithMinTimestamp.views[0].timestamp)) {
      repoWithMinTimestamp = repo;
    }
  });

  /* Get the oldest date */
  startDate = new Date(repoWithMinTimestamp.views[0].timestamp);

  /* Adding dummy data to all repos to start from the oldest date */
  aggregateChartArray[index].repoArray.map(repo => {
    days = Math.abs(new Date(repo.views[0].timestamp).getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  
    if(days != 0) {
      var time = startDate;
      for(var index = 0; index < days; ++index) {
        repo.views.splice(index, 0, { timestamp: time, count: 0, uniques: 0});
        time.setDate(time.getDate() + 1);
      }
    }
  });

  aggregateChartArray[index].chartToEdit.data.labels = repoWithMinTimestamp.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));

  aggregateChartArray[index].repoArray.forEach(repo => {
    aggregateChartArray[index].chartToEdit.data.datasets.push({
                                      label: 'Unique Views (' + repo.reponame + ')',
                                      backgroundColor: 'rgb(0,0,0, 0)',
                                      borderColor: '#FDCB00',
                                      data: repo.views.map(h=>h.uniques),
                                    });

    aggregateChartArray[index].chartToEdit.data.datasets.push({
                                      label: 'Views (' + repo.reponame + ')',
                                      backgroundColor: 'rgb(0,0,0, 0)',
                                      borderColor: '#603A8B',
                                      data: repo.views.map(h=>h.count),
                                    });
  });

  aggregateChartArray[index].chartToEdit.update();  
}

jQuery(function(){
  $("button.add-btn").on("click", function(){
    repoIdToAdd = $(this).attr("data-repoId");
    
    /* Update charts buttons state */
    for(var i = 0; i < aggregateChartArray.length; ++i) {
      buttonState = false;
      for(var j = 0; j < aggregateChartArray[i].repoArray.length; ++j) {
        if(aggregateChartArray[i].repoArray[j]._id == repoIdToAdd) {
          buttonState = true;
          break;
        }
      }

      if(buttonState) {
        document.getElementById(i).className = "chart-btn btn btn-dark";
      } else {
        document.getElementById(i).className = "chart-btn btn btn-outline-dark";
      }
    }
    
  })
});

function chartButtonListener(e) {
  button = e.target;

  if(button.classList.contains('btn-outline-dark')) {
    aggregateTwoCharts(button.id, repoIdToAdd);
    button.className = "chart-btn btn btn-dark";
  } else if(button.classList.contains('btn-dark')) {
    removeFromAggregateChart(button.id, repoIdToAdd);
    button.className = "chart-btn btn btn-outline-dark";
  }
}

jQuery(function(){
  $("button.share-btn").on("click", function(){
    repoId = $(this).attr("data-repoId");
  })
});

$(function () {
  $('[data-toggle="popover"]').popover();
})

function chartDeleteListener(e) {
  console.log("TODO DELETEING");
  button = e.target;

  /* Remove from database */

  /* Remove from HTML Page*/

  /* Remove from aggregateChartArray */
}