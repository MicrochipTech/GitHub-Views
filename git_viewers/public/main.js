var repoId = null;

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

data.userRepos.forEach(repo => {
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
      options: {
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
  });
});

data.sharedRepos.forEach(repo => {
  var ctx = document.getElementById(repo._id).getContext('2d');

  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

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
      options: {
        elements: {
          line: {
              tension: 0
          }
        }
      }
  });
});

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
        console.log(data);
    },
    error: function () {

    }
  })
}

jQuery(function(){
  $("i.fa-share-alt").on("click", function(){
    repoId = $(this).attr("data-repoId");
  })
});
