const cron = require("node-cron");
const fetch = require("node-fetch");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const UserCtrl = require("../controllers/UserCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

async function updateRepositories() {
  console.log("Updating repositories for all users");

  // const users = await UserModel.find({
  //   githubId: { $ne: null },
  //   token_ref: { $exists: true }
  // }).populate("token_ref");

  // const userPromises = users.map(async user => {
  //   await UserCtrl.syncRepos(user, user.token_ref.value);
  // });
  // await Promise.all(userPromises);
  UserCtrl.syncRepos();
}

updateRepositories();

cron.schedule("25 12 * * *", async () => {
  await updateRepositories();
});
