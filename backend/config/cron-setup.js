const cron = require("node-cron");
const fetch = require("node-fetch");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const UserCtrl = require("../controllers/UserCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

async function updatingRepositories() {
  console.log("Updating repositories for all users");

  /* BEGIN - update repoid and not_found */
  console.log("Updating repoid and not_found fields");

  const repos = await RepositoryModel.find().populate({
    path: "user_id",
    populate: { path: "token_ref" }
  });

  const idUpdatePromises = repos.map(async repoEntry => {
    if (repoEntry.user_id.token_ref) {
      const {
        response: repoDetailsResponse,
        responseJson: repoDetails
      } = await GitHubApiCtrl.getRepoTraffic(
        repoEntry.reponame,
        repoEntry.user_id.token_ref.value
      ).catch(() =>
        console.log(
          "Updating repoid and not_found fields: Error getting repo traffic"
        )
      );

      if (repoDetails) {
        switch (repoDetailsResponse.status) {
          case 404:
            /* Mark the repository as not found */
            repoEntry.not_found = true;

            break;

          case 301: {
            /* The repository was renamed */

            const redirectDetailsResponse = await fetch(repoDetails.url, {
              method: "get",
              redirect: "manual",
              headers: {
                Authorization: `token ${repoEntry.user_id.token_ref.value}`
              }
            }).catch(() =>
              console.log(
                "Updating repoid and not_found fields: Error after redirect"
              )
            );
            const redirectDetails = await redirectDetailsResponse.json();

            if (redirectDetails) {
              repoEntry.not_found = false;
              repoEntry.github_repo_id = redirectDetails.id;
            } else {
              console.log(
                `Error trying to update github_id and not_found fields for ${repoEntry.reponame}`
              );
            }

            break;
          }
          case 200:
            /* The repository exists and will be updated */
            repoEntry.not_found = false;
            repoEntry.github_repo_id = repoDetails.id;

            break;

          default:
            console.log("Error updateing repoid and not_found fields");
        }
        await repoEntry.save();
      }
    }
  });
  await Promise.all(idUpdatePromises);
  /* END - update repoid and not_found */

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true }
  }).populate("token_ref");

  const userPromises = users.map(async user => {
    await UserCtrl.syncRepos(user);
  });
  Promise.all(userPromises);
}

updatingRepositories();

cron.schedule("25 12 * * *", async () => {
  await updatingRepositories();
});
