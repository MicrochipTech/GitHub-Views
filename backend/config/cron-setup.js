const cron = require("node-cron");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

async function updateRepositories() {
  console.log(`Updating local database`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const repos = await RepositoryModel.find({ not_found: false }).catch(() => {
    console.log(`updateRepositories: error getting repo ${repo.full_name}`);
  });

  /*
   * Before updating, repos mark them as not updated.
   * After update, if it is still marked as not updated, it means it was deleted.
   */
  repos.forEach(repo => {
    repo.not_found = true;
  });

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true }
  }).populate("token_ref");

  const userPromises = users.map(async user => {
    const token = user.token_ref.value;
    /* Get all repos for a user through GitHub API */
    const githubRepos = await GitHubApiCtrl.getUserRepos(user, token).catch(
      e => {
        console.log(`updateRepositories ${user.username}: error getting user repos`);
        if (
          e.response.status === 403 &&
          e.response.headers["x-ratelimit-remaining"] === "0"
        ) {
          console.log("Forbidden. No more remaining requests");
        }
      }
    );

    /* Get repos from local database */
    const userRepos = repos.filter(repo => repo.user_id.equals(user._id));

    if (githubRepos === undefined) {
      return;
    }

    const updateReposPromises = githubRepos.map(async githubRepo => {
      const repoEntry = userRepos.find(
        userRepo => userRepo.github_repo_id === String(githubRepo.id)
      );

      if (repoEntry === undefined) {
        const newRepo = await RepositoryCtrl.createRepository(
          githubRepo,
          user._id,
          token
        ).catch(e => {
          console.log(e, `updateRepositories ${user}: error creating a new repo`);
        });

        await newRepo.save();
      } else {
        /* The repository still exists on GitHub*/
        repoEntry.not_found = false;

        /* Update repository name if changed */
        if (repoEntry.reponame !== githubRepo.full_name) {
          repoEntry.reponame = githubRepo.full_name;
        }

        /* Update forks */
        repoEntry.forks.tree_updated = false;
        if (
          repoEntry.forks.data.length === 0 ||
          repoEntry.forks.data[repoEntry.forks.data.length - 1].count !==
            githubRepo.forks_count
        ) {
          repoEntry.forks.data.push({
            timestamp: today.toISOString(),
            count: githubRepo.forks_count
          });
        }

        /* Update traffic (views, clones, referrers, contents) */
        const { status, data: traffic } = await RepositoryCtrl.getRepoTraffic(
          repoEntry.reponame,
          token
        );

        if (status === true) {
          RepositoryCtrl.updateRepoTraffic(repoEntry, traffic);
        } else {
          console.log(
            `updateRepositories: Fail getting traffic data for repo ${repoEntry.reponame}`
          );
        }
      }
    });
    await Promise.all(updateReposPromises);
  });
  await Promise.all(userPromises);

  saveAllRepos = repos.map(async repo => await repo.save());
  await Promise.all(saveAllRepos);

  console.log(`Local database update finished`);
}

async function setCron() {
  console.log("Setting a cronjob every day, to update repositories.");
  cron.schedule("25 12 * * *", async () => {
    await updateRepositories();
  });
}

module.exports = {
  setCron,
  updateRepositories
};
