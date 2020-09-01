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

  let repos;
  try {
    repos = await RepositoryModel.find({ not_found: false });
  } catch (err) {
    // TODO
  }

  /* Before updating, repos mark them as not updated.
  After update, if it is still marked as not updated, it means it was deleted. */
  repos.forEach((repo) => {
    repo.not_found = true;
  });

  let users;
  try {
    users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true },
    }).populate("token_ref");
  } catch (err) {
    // TODO
  }

  const newRepoRequests = {};

  const userPromises = users.map(async (user) => {
    /* For each user update the repos which contains its id in the users list */
    const token = user.token_ref.value;

    let githubRepos;
    try {
      githubRepos = await GitHubApiCtrl.getUserRepos(token);
    } catch (err) {
      // TODO
    }

    if (githubRepos.success === false) {
      /* If the request to get the repos of the user with traffic details fails,
      then return */
      console.log(`Could not get repos for ${user.username}`);
      return;
    }

    console.log(`User ${user.username} has ${githubRepos.data.length} repos.`);

    const updateReposPromises = githubRepos.data.map(async (githubRepo, j) => {
      /* For each repo which is included in the request, update the latest traffic infos */
      console.log(`Checking ${githubRepo.full_name}, ${j}`);

      /* Search in the database the repository which will be updated */
      const repoEntry = repos.find(
        (r) => String(r.github_repo_id) === String(githubRepo.id)
      );

      if (repoEntry === undefined) {
        /* If repoEntry is undefined, it means that there is no repository in the database
        with the remote repository name, so it will be created */

        if (newRepoRequests[githubRepo.full_name] === undefined) {
          console.log(
            `Repos ${githubRepo.full_name}, ${githubRepo.id} does not exist in db. Creating.`
          );

          try {
            newRepo = await RepositoryCtrl.createRepository(
              githubRepo,
              user._id,
              token
            );
          } catch (err) {
            // TODO
            console.log(
              err,
              `updateRepositories ${user}: error creating a new repo`
            );
          }

          if (newRepo !== undefined) {
            if (newRepo.success === false) {
              console.log(
                `Fail creating new repo with name ${githubRepo.full_name}`
              );
              return;
            }

            newRepoRequests[githubRepo.full_name] = newRepo.data;
          }
        } else {
          newRepoRequests[githubRepo.full_name].users.push(user._id);
        }
      } else {
        /* The repository still exists on GitHub */
        repoEntry.not_found = false;

        /* Update repository name, if changed */
        if (repoEntry.reponame !== githubRepo.full_name) {
          repoEntry.nameHistory.push({
            date: new Date(),
            change: `${repoEntry.reponame} -> ${githubRepo.full_name}`,
          });
          repoEntry.reponame = githubRepo.full_name;
        }

        /* Update forks */
        repoEntry.forks.tree_updated = false;

        /* today variable is used to store the timestamp */
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        /* Details from githubRepo variable, contains also the current forks count number.
        forks.data contains the variation of the forks, when the forks number is changed. */
        const forks_sum = repoEntry.forks.data.reduce(
          (total, currentValue) => total + currentValue.count,
          0
        );
        if (forks_sum !== githubRepo.forks_count) {
          repoEntry.forks.data.push({
            timestamp: today.toISOString(),
            count: githubRepo.forks_count - forks_sum,
          });
        }

        /* Update commits update variable */
        repoEntry.commits.updated = false;

        /* Update traffic (views, clones, referrers, contents) */
        let repoTraffic;
        try {
          repoTraffic = await RepositoryCtrl.getRepoTraffic(
            repoEntry.reponame,
            token
          );
        } catch (err) {
          // TODO
        }

        const { status, data: traffic } = repoTraffic;

        if (status === true) {
          RepositoryCtrl.updateRepoTraffic(repoEntry, traffic);
        } else {
          console.log(
            `updateRepositories: Fail getting traffic data for repo ${repoEntry.reponame}`
          );
        }
      }
    });

    try {
      await Promise.all(updateReposPromises);
    } catch (err) {
      // TODO
    }
  });

  try {
    await Promise.all(userPromises);
  } catch (err) {
    // TODO
  }

  const saveNewRepos = Object.keys(newRepoRequests).map((k) =>
    newRepoRequests[k].save()
  );
  try {
    await Promise.all(saveNewRepos);
  } catch (err) {
    // TODO
  }

  const updateRepos = repos.map((repo) => repo.save());
  try {
    await Promise.all(updateRepos);
  } catch (err) {
    // TODO
  }

  console.log(`Local database update finished`);
}

async function setCron() {
  console.log("Setting a cronjob every day, to update repositories.");
  cron.schedule("25 12 * * *", async () => {
    if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
      runGenerator(updateRepositoriesGenerator());
    } else {
      try {
        await updateRepositories();
      } catch (err) {
        // TODO
      }
    }
  });
}

module.exports = {
  setCron,
  updateRepositories: async () => {
    if (UPDATE_WITH_BACK_OFF_ON_ERROR) {
      try {
        await runGenerator(updateRepositoriesGenerator());
      } catch (err) {
        // TODO
      }
    } else {
      try {
        await updateRepositories();
      } catch (err) {
        // TODO
      }
    }
  },
};
