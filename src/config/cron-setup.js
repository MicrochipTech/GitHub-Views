const cron = require("node-cron");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

async function updateRepos() {
  console.log("Updating repositories...");

  const repos = await RepositoryModel.find().populate("user_id");
  repos.forEach(async repoEntry => {
    const response = await GitHubApiCtrl.getRepoTraffic(
      repoEntry.reponame,
      repoEntry.user_id.token
    );

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
    repoEntry.save();
  });
}

async function checkForNewRepos() {
  console.log("Checking for new repos");

  const users = await UserModel.find();
  users.forEach(async user => {
    const response = await GitHubApiCtrl.getUserRepos(user);

    response.data.forEach(async repo => {
      const repoEntry = await RepositoryModel.findOne({
        reponame: repo.full_name
      });

      if (repoEntry === null) {
        const repoTrafficResponse = await GitHubApiCtrl.getRepoTraffic(
          repo.full_name,
          user.token
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
  });
}

cron.schedule("25 12 * * *", () => {
  updateRepos();
  checkForNewRepos();
});
