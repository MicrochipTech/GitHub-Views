const cron = require("node-cron");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

async function* updateRepositoriesGen() {
  console.log(`Updating local database`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const repos = await RepositoryModel.find({ not_found: false }).catch(() => {
    console.log(`syncRepos: error getting repo ${repo.full_name}`);
  });

  repos.forEach(repo => {
    repo.not_found = true;
  });

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true }
  }).populate("token_ref");

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const token = user.token_ref.value;

    const githubRepos = await GitHubApiCtrl.getUserRepos(token);
    if (githubRepos.success === false) {
      yield false;
    }

    const userRepos = repos.filter(repo => repo.user_id.equals(user._id));

    for (let j = 0; j < githubRepos.length; j++) {
      const githubRepo = githubRepos[j];
      const repoEntry = userRepos.find(
        userRepo => userRepo.github_repo_id === String(githubRepo.id)
      );
    }
  }
}

updateRepositoriesGen();

async function updateRepositories() {
  console.log(`Updating local database`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const repos = await RepositoryModel.find({ not_found: false }).catch(() => {
    console.log(`syncRepos: error getting repo ${repo.full_name}`);
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
    const githubRepos = await GitHubApiCtrl.getUserRepos(token);
    // .catch(e => {
    //   console.log(`syncRepos ${user.username}: error getting user repos`);
    //   if (
    //     e.response.status === 403 &&
    //     e.response.headers["x-ratelimit-remaining"] === "0"
    //   ) {
    //     console.log("Forbidden. No more remaining requests");
    //   }
    // });

    if (githubRepos.success === false) {
      return;
    }

    // if (githubRepos === undefined) {
    //   return;
    // }

    /* Get repos from local database */
    const userRepos = repos.filter(repo => repo.user_id.equals(user._id));

    const updateReposPromises = githubRepos.data.map(async githubRepo => {
      const repoEntry = userRepos.find(
        userRepo => userRepo.github_repo_id === String(githubRepo.id)
      );

      if (repoEntry === undefined) {
        const newRepo = await RepositoryCtrl.createRepository(
          githubRepo,
          user._id,
          token
        ).catch(e => {
          console.log(e, `syncRepos ${user}: error creating a new repo`);
        });

        if (newRepo.success === false) {
          return;
        }

        await newRepo.data.save();
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
            `Fail getting traffic data for repo ${repoEntry.reponame}`
          );
        }
      }
    });
    await Promise.all(updateReposPromises);
  });
  await Promise.all(userPromises);

  const saveAllRepos = repos.map(repo => repo.save());
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
