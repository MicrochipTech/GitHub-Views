const cron = require("node-cron");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");

/*
Using back off is way slower because requests are made sequential.
Still, being slower actually reduces the chance of making 5000+ requests per hour.
*/
const UPDATE_WITH_BACK_OFF_ON_ERROR = false;

async function* updateRepositoriesGenerator() {
  console.log(`Updating local database`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const repos = await RepositoryModel.find({ not_found: false });

  repos.forEach((repo) => {
    repo.not_found = true;
  });

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true },
  }).populate("token_ref");

  for (let i = 0; i < users.length; i += 1) {
    console.log(`-----> User ${i}/${users.length}`);

    const user = users[i];
    const token = user.token_ref.value;

    const githubRepos = await GitHubApiCtrl.getUserRepos(token);
    const retry = yield githubRepos.success;

    if (retry) {
      i--;
      continue;
    } else {
      const userRepos = repos.filter((r) => r.users.indexOf(user._id) !== -1);

      for (let j = 0; j < githubRepos.data.length; j += 1) {
        console.log(`--> Repo ${j}/${githubRepos.data.length}`);
        const githubRepo = githubRepos.data[j];
        const repoEntry = userRepos.find(
          (userRepo) => userRepo.github_repo_id === String(githubRepo.id)
        );
        if (repoEntry === undefined) {
          const newRepo = await RepositoryCtrl.createRepository(
            githubRepo,
            user._id,
            token
          );

          const retry = yield newRepo.success;
          if (retry) {
            j--;
            continue;
          }

          newRepo.data.save();
        } else {
          /* The repository still exists on GitHub */
          repoEntry.not_found = false;

          /* Update repository name if changed */
          if (repoEntry.reponame !== githubRepo.full_name) {
            repoEntry.nameHistory.push({
              date: new Date(),
              change: `${repoEntry.reponame} -> ${githubRepo.full_name}`,
            });
            repoEntry.reponame = githubRepo.full_name;
          }

          /* Update forks */
          repoEntry.forks.tree_updated = false;

          const forksDataLen = repoEntry.forks.data.length;
          if (forksDataLen === 0) {
            repoentry.forks.data.push({
              timestamp: today.toisostring(),
              count: githubrepo.forks_count,
            });
          } else {
            const lastForksCount = repoEntry.forks.data[forksDataLen - 1].count;
            repoentry.forks.data.push({
              timestamp: today.toisostring(),
              count: githubrepo.forks_count - lastforkscount,
            });
          }

          /* Update traffic (views, clones, referrers, contents) */
          const { status, data: traffic } = await RepositoryCtrl.getRepoTraffic(
            repoEntry.reponame,
            token
          );

          const retry = yield status;
          if (retry) {
            j--;
            continue;
          }

          RepositoryCtrl.updateRepoTraffic(repoEntry, traffic);
          repoEntry.save();
        }
      }
    }
  }
}

async function runGenerator(g, retry = false) {
  for (let r = await g.next(retry); !r.done; r = await g.next(false)) {
    if (!r.value) {
      console.log("Generator returned error.");
      setTimeout(() => {
        runGenerator(g, true);
      }, 1000 * 60 * 60);
      break;
    }
  }
}

async function updateRepositories() {
  console.log(`Updating local database`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const repos = await RepositoryModel.find({ not_found: false });

  /*
   * Before updating, repos mark them as not updated.
   * After update, if it is still marked as not updated, it means it was deleted.
   */
  repos.forEach((repo) => {
    repo.not_found = true;
  });

  const users = await UserModel.find({
    githubId: { $ne: null },
    token_ref: { $exists: true },
  }).populate("token_ref");

  //const userPromises = users.map(async (user) =>

  const newRepoRequests = {};

  const userPromises = users.map(async (user) => {
    // for (let i = 0; i < users.length; i += 1) {
    // const user = users[i];

    const token = user.token_ref.value;
    const githubRepos = await GitHubApiCtrl.getUserRepos(token);

    if (githubRepos.success === false) {
      console.log(`Could not get repos for ${user.username}`);
      return;
    }

    // const userRepos = repos.filter(
    //   (r) => r.users !== undefined && r.users.indexOf(user._id) !== -1
    // );
    // console.log(
    //   `User ${user.username} has ${userRepos.length} in db and ${githubRepos.data.length} on Github.`
    // );

    console.log(`User ${user.username} has ${githubRepos.length} repos.`);

    const updateReposPromises = githubRepos.data.map(async (githubRepo, j) => {
      // for (let j = 0; j < githubRepos.data.length; j += 1) {
      //   const githubRepo = githubRepos.data[j];

      console.log(`Checking ${githubRepo.full_name}, ${j}`);

      // const repoEntry = userRepos.find(
      //   (userRepo) => String(userRepo.github_repo_id) === String(githubRepo.id)
      // );

      const repoEntry = repos.find((r) => r.reponame === githubRepo.full_name);

      if (repoEntry === undefined) {
        if (newRepoRequests[githubRepo.full_name] === undefined) {
          console.log(
            `Repos ${githubRepo.full_name}, ${githubRepo.id} does not exist in db. Creating.`
          );

          const newRepo = await RepositoryCtrl.createRepository(
            githubRepo,
            user._id,
            token
          ).catch((e) => {
            console.log(
              e,
              `updateRepositories ${user}: error creating a new repo`
            );
          });

          if (newRepo.success === false) {
            console.log(`Fild cretig new repo ${githubRepo.full_name}`);
            return;
          }

          newRepoRequests[githubRepo.full_name] = newRepo.data;
        } else {
          newRepoRequests[githubRepo.full_name].users.push(user._id);
        }
      } else {
        /* The repository still exists on GitHub */
        repoEntry.not_found = false;

        /* Update repository name if changed */
        if (repoEntry.reponame !== githubRepo.full_name) {
          repoEntry.nameHistory.push({
            date: new Date(),
            change: `${repoEntry.reponame} -> ${githubRepo.full_name}`,
          });
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
            count: githubRepo.forks_count,
          });
        }

        /* Update commits update variable */
        repoEntry.commits.updated = false;

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

  const saveNewRepos = Object.keys(newRepoRequests).map((k) =>
    newRepoRequests[k].save()
  );
  await Promise.all(saveNewRepos);

  const updateRepos = repos.map((repo) => repo.save());
  await Promise.all(updateRepos);

  console.log(`Local database update finished`);
}

async function setCron() {
  console.log("Setting a cronjob every day, to update repositories.");
  cron.schedule("25 12 * * *", async () => {
    if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
      runGenerator(updateRepositoriesGenerator());
    } else {
      await updateRepositories();
    }
  });
}

module.exports = {
  setCron,
  updateRepositories: async () => {
    if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
      await runGenerator(updateRepositoriesGenerator());
    } else {
      await updateRepositories();
    }
  },
};
