data.myRepos.forEach(repo => {
  var ctx = document.getElementById(repo.repoId).getContext('2d');

  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: repo.history.map(h=>h.timestamp),
          datasets: [{
              label: 'Unique Views',
              backgroundColor: 'rgb(0,0,0, 0)',
              borderColor: '#FDCB00',
              data: repo.history.map(h=>h.unique),
          }, {
              label: 'Views',
              backgroundColor: 'rgb(0,0,0, 0)',
              borderColor: '#603A8B',
              data: repo.history.map(h=>h.views),
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
})
