const cron = require("node-cron");
const axios = require("axios");
const repositoryCtrl = require("../controllers/RepositoryCtrl");
const userCtrl = require("../controllers/UserCtrl");

function updateRepos() {
  console.log("Updating repositories");

  repositoryCtrl.getAllWithPopulate("user_id").then(repos => {
    /* Iterate trough all repos in database */
    for (let repoIndex = 0; repoIndex < repos.length; repoIndex += 1) {
      const repoEntry = repos[repoIndex];

      /* Get traffic for the current repo */
      axios({
        url: `https://api.github.com/repos/${repoEntry.reponame}/traffic/views`,
        headers: { Authorization: `token ${repoEntry.user_id.token}` }
      })
        .then(response => {
          let viewsToUpdate = response.data.views;

          if (repoEntry.views.length !== 0) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const lastTimestamp =
              repoEntry.views[repoEntry.views.length - 1].timestamp;
            viewsToUpdate = viewsToUpdate.filter(info => {
              const timestampDate = new Date(info.timestamp);

              if (
                timestampDate.getTime() > lastTimestamp.getTime() &&
                timestampDate.getTime() < today.getTime()
              ) {
                return true;
              }

              return false;
            });
          }

          for (
            let viewIndex = 0;
            viewIndex < viewsToUpdate.length;
            viewIndex += 1
          ) {
            repoEntry.views.push(viewsToUpdate[viewIndex]);
          }

          repoEntry.save();
        })
        .catch(error => {
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    }
  });
}

function checkForNewRepos() {
  console.log("Checking for new repos");

  userCtrl.getAllUsers().then(users => {
    for (let userIndex = 0; userIndex < users.length; userIndex += 1) {
      axios({
        url: `https://api.github.com/users/${users[userIndex].username}/repos`,
        headers: { Authorization: `token ${users[userIndex].token}` },
        params: { type: "all" }
      })
        .then(response => {
          const getRepoTraffic = async (user, reponame) => {
            const repoTrafficResponse = await axios({
              url: `https://api.github.com/repos/${reponame}/traffic/views`,
              headers: { Authorization: `token ${user.token}` }
            });
            const { count, uniques } = repoTrafficResponse.data;
            let { views } = repoTrafficResponse.data;

            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            views = views.filter(info => {
              const infoTimestamp = new Date(info.timestamp);

              if (infoTimestamp.getTime() < today.getTime()) {
                return true;
              }

              return false;
            });

            repositoryCtrl.create(user._id, reponame, count, uniques, views);
          };

          const repos = response.data;

          for (let repoIndex = 0; repoIndex < repos.length; repoIndex += 1) {
            repositoryCtrl
              .getRepoByName(repos[repoIndex].full_name)
              .then(repo => {
                if (repo === undefined) {
                  getRepoTraffic(users[userIndex], repos[repoIndex].full_name);
                }
              });
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  });
}

cron.schedule("00 07 * * *", () => {
  updateRepos();
  checkForNewRepos();
});
