const cron = require("node-cron");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");
const TokenModel = require("../models/Token");
const chalk = require("chalk");
const axios = require("axios");

updateRepos()

async function updateRepos() {
  console.log("Updating repositories...");

  const repos = await RepositoryModel.find().populate({
    path: "user_id",
    populate: { path: "token_ref" }
  });

  /* BEGIN - update repoid and not_found */
  console.log("Updating repoid and not_found...");

  repos.forEach(async repoEntry => {
    if (repoEntry.user_id.token_ref) {
      const repoDetails = await axios({
        url: `https://api.github.com/repos/${repoEntry.reponame}`,
        headers: { Authorization: `token ${repoEntry.user_id.token_ref.value}` }
      });

      if(repoDetails){
        switch(repoDetails.data.message) {
          case "Not Found":
            /* Mark the repository as not found */
            repoEntry.not_found = true;

            break;

          case "Moved Permanently":
            /* The repository was renamed */
            const redirectDetails = await axios({
              url: repoDetails.data.url,
              headers: { Authorization: `token ${repoEntry.user_id.token_ref.value}` }
            });
  
            if(redirectDetails){
              repoEntry.github_repo_id = redirectDetails.data.id;
            } else {
              console.log(`Error trying to update id for ${repoEntry.reponame}`)
            }

            break;

          default:
            /* The repository exists and will be updated */
            repoEntry.not_found = false;
            repoEntry.github_repo_id = repoDetails.data.id;
        }
      }
    }
  });

  /* END - update repoid and not_found */

  repos.forEach(async repoEntry => {
    if (!repoEntry.not_found && repoEntry.user_id.token_ref) {
      const response = await GitHubApiCtrl.getRepoTraffic(
        repoEntry.reponame,
        repoEntry.user_id.token_ref.value
      ).catch(e =>
        console.log(
          chalk.bgRed(
            `Error updading repo ${repoEntry.reponame} of user ${repoEntry.user_id.username}`
          )
        )
      );

      if (response) {
        switch(response.data.message) {
          case "Not Found":
            /* The repository was not found*/
            repoEntry.not_found = true;

            break;

          case "Moved Permanently":
            /* The repository was renamed */
            const redirectDetails = await axios({
              url: `https://api.github.com/repositories/${repoEntry.github_repo_id}`,
              headers: { Authorization: `token ${repoEntry.user_id.token_ref.value}` }
            });
  
            if(redirectDetails){
              repoEntry.reponame = redirectDetails.data.full_name;
            } else {
              console.log(`Error trying to rename ${repoEntry.reponame}`)
            }

            response = await axios({
              url: response.data.url,
              headers: { Authorization: `token ${repoEntry.user_id.token_ref.value}` }
            });

            if(!response) {
              console.log(`Error trying update repo ${repoEntry.reponame} after rename`)
            }

            /* Not breaking - the repository traffic will be updated */

          default:
            /* The repository exists and will be updated */

            let viewsToUpdate = response.data.views;
            if (repoEntry.views.length !== 0) {
              const last = repoEntry.views[repoEntry.views.length - 1].timestamp;
              viewsToUpdate = viewsToUpdate.filter(info => {
                const timestampDate = new Date(info.timestamp);
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                if (
                  timestampDate.getTime() > last.getTime() &&
                  timestampDate.getTime() < today.getTime()
                ) {
                  return true;
                }

                return false;
              });
            }

            repoEntry.views.push(...viewsToUpdate);
        }
        await repoEntry.save();
      }
    }
  });
}

async function checkForNewRepos() {
  console.log("Checking for new repos");

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true }
  }).populate("token_ref");

  users.forEach(async user => {
    const repos = await GitHubApiCtrl.getUserRepos(
      user,
      user.token_ref.value
    ).catch(e => console.log(`Error checkForNewRepos ${user.username}`));

    if (repos) {
      repos.forEach(async repo => {
        const repoEntry = await RepositoryModel.findOne({
          reponame: repo.full_name,
          user_id: user._id
        });

        if (repoEntry === null) {
          const repoTrafficResponse = await GitHubApiCtrl.getRepoTraffic(
            repo.full_name,
            user.token_ref.value
          );
          const { views } = repoTrafficResponse.data;
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          if (
            views.length !== 0 &&
            new Date(views[views.length - 1].timestamp).getTime() >=
              today.getTime()
          ) {
            views.pop();
          }

          await new RepositoryModel({
            user_id: user._id,
            reponame: repo.full_name,
            views
          }).save();
        }
      });
    }
  });
}

cron.schedule("25 12 * * *", () => {
  updateRepos();
  checkForNewRepos();
});
