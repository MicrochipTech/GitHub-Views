const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const RepositoryModel = require("../models/Repository");
const UserModel = require("../models/User");
const { logger, errorHandler } = require("../logs/logger");

async function updateRepositoriesAsynch() {
  logger.info(`${arguments.callee.name}: Updating local database...`);

  let repos;
  try {
    repos = await RepositoryModel.aggregate([
      {
        $match: { not_found: false },
      },
      {
        $project: {
          github_repo_id: 1,
          reponame: 1,
          "referrers.name": 1,
          "contents.path": 1,
          views_length: { $size: "$views.data" },
          last_view: { $arrayElemAt: ["$views.data", -1] },
          clones_length: { $size: "$clones.data" },
          last_clone: { $arrayElemAt: ["$clones.data", -1] },
          forks_sum: { $sum: "$forks.data.count" },
        },
      },
    ]);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all repos from database.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all users from database.`,
      err
    );
  }

  const newRepoRequests = {};
  const processedRepos = [];

  // const userPromises = users.map(async (user) => {
  for (const i in users) {
    /* For each user update the repos which contains its id in the users list */
    const user = users[i];
    const token = user.token_ref.value;

    let githubRepos;
    try {
      githubRepos = await GitHubApiCtrl.getUserRepos(token);
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught while getting repository details with GitHub API for user ${user.username}.`,
        err
      );
    }

    if (githubRepos.success === false) {
      /* If the request to get the repos of the user with traffic details fails,
      then return */
      logger.warn(
        `${arguments.callee.name}: Could not get repos for user ${user.username}.`
      );
      return;
    }

    logger.info(
      `${arguments.callee.name}: User ${user.username} has ${githubRepos.data.length} repos.`
    );

    const updateReposPromises = githubRepos.data.map(async (githubRepo, j) => {
      /* For each repo which is included in the request, update the latest traffic infos */
      // logger.info(
      //   `${arguments.callee.name}: Checking ${githubRepo.full_name}, ${j}`
      // );

      /* Search in the database the repository which will be updated */
      const repoEntry = repos.find(
        (r) => String(r.github_repo_id) === String(githubRepo.id)
      );

      if (repoEntry === undefined) {
        /* If repoEntry is undefined, it means that there is no repository in the database
        with the remote repository name, so it will be created */
        let newRepo;
        try {
          newRepo = await RepositoryCtrl.createRepository(
            githubRepo,
            user._id,
            token
          );
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while creating new repository in database with name ${githubRepo.full_name}.`,
            err
          );
        }

        if (newRepoRequests[githubRepo.full_name] === undefined) {
          logger.info(
            `${arguments.callee.name}: Repo ${githubRepo.full_name}, ${githubRepo.id} does not exist in db. Creating.`
          );

          if (newRepo !== undefined) {
            if (newRepo.success === false) {
              logger.warn(
                `${arguments.callee.name}: Fail creating new repo with name ${githubRepo.full_name}.`
              );
              return;
            }

            newRepoRequests[githubRepo.full_name] = newRepo.data;
          }
        } else {
          newRepoRequests[githubRepo.full_name].users.push(user._id);
        }
      } else {
        // The repository still exists on GitHub
        // repoEntry.not_found = false;
        // Update forks
        // repoEntry.forks.tree_updated = false;
        // Update commits update variable
        // repoEntry.commits.updated = false;

        if (processedRepos.indexOf(repoEntry._id) !== -1) {
          return;
        }

        RepositoryModel.updateOne(
          { _id: repoEntry._id },
          {
            // not_found: false,
            "forks.tree_updated": false,
            "commits.updated": false,
          }
        ).exec();

        /* Update repository name, if changed */
        if (repoEntry.reponame !== githubRepo.full_name) {
          RepositoryModel.updateOne(
            { _id: repoEntry._id },
            {
              reponame: githubRepo.full_name,
              $push: {
                nameHistory: {
                  date: new Date(),
                  change: `${repoEntry.reponame} -> ${githubRepo.full_name}`,
                },
              },
            }
          ).exec();
        }

        /* today variable is used to store the timestamp */
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        /* Details from githubRepo variable, contains also the current forks count number.
        forks.data contains the variation of the forks, when the forks number is changed. */

        if (repoEntry.forks_sum !== githubRepo.forks_count) {
          RepositoryModel.updateOne(
            { _id: repoEntry._id },
            {
              $push: {
                "forks.data": {
                  timestamp: today.toISOString(),
                  count: githubRepo.forks_count - repoEntry.forks_sum,
                },
              },
            }
          ).exec();
        }

        /* Update traffic (views, clones, referrers, contents) */
        let repoTraffic;
        try {
          repoTraffic = await RepositoryCtrl.getRepoTraffic(
            repoEntry.reponame,
            token
          );
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while geting repository traffic for repo: ${repoEntry.reponame}.`,
            err
          );
        }

        const { status, data: traffic } = repoTraffic;

        if (status === true) {
          RepositoryCtrl.updateRepoTraffic(repoEntry, traffic);
          processedRepos.push(repoEntry._id);
        } else {
          // processedRepos.splice(processedRepos.indexOf(repoEntry._id), 1);
          logger.warn(
            `${arguments.callee.name}: Fail getting traffic data for repo ${repoEntry.reponame}.`
          );
        }
      }
    });

    try {
      await Promise.all(updateReposPromises);
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught while updating repositories for user: ${user.username}.`,
        err
      );
    }
    // });
  }

  try {
    await Promise.all(userPromises);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while updating repositories in database.`,
      err
    );
  }

  const saveNewRepos = Object.keys(newRepoRequests).map((k) =>
    newRepoRequests[k].save()
  );
  try {
    await Promise.all(saveNewRepos);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while saving new rpos in database.`,
      err
    );
  }

  const updateRepos = repos.map(async (repo) => {
    if (processedRepos.indexOf(repo._id) === -1) {
      await RepositoryModel.updateOne({ _id: repo._id }, { not_found: true });
    }
  });
  try {
    await Promise.all(updateRepos);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while saving repository updates in database.`,
      err
    );
  }

  logger.info(`${arguments.callee.name}: Local database update finished.`);
}

module.exports = updateRepositoriesAsynch;
