var repoId = null;

data.userRepos.forEach(repo => {
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