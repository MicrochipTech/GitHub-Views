const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const { logger, errorHandler } = require("../logs/logger");
const { getRepoViews } = require("./GitHubApiCtrl");

async function updateProfile(user) {
  let userDetails, userEmails;

  try {
    userDetails = await GitHubApiCtrl.getUserProfile(user.token_ref.value);
    userEmails = await GitHubApiCtrl.getUserEmails(user.token_ref.value);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting from GitHub API emails or details for user with _id ${user._id}.`,
      err
    );
    return false;
  }

  if (userDetails === undefined || userEmails === undefined) {
    logger.warning(
      `Fail when getting from GitHub API emails or details for user with _id ${user._id}.`
    );
    return false;
  }
  if (!userDetails.success || !userEmails.success) {
    logger.warning(
      `Getting emails or details for user with _id ${user._id} was not completed successfully.`
    );
    return false;
  }

  try {
    await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        username: userDetails.data.login,
        githubEmails: userEmails.data.filter(
          (emails) => emails.visibility !== null
        ),
      }
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when updating emails and details for user with _id ${user._id}.`,
      err
    );
    return false;
  }

  return true;
}

async function unfollowSharedRepo(req, res) {
  const { repoId } = req.body;
  let updateRes;
  try {
    updateRes = await UserModel.update(
      { _id: req.user._id },
      { $pull: { sharedRepos: repoId } }
    );
  } catch (err) {
    res.send({
      success: false,
      error: `Error updating user in database.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught when updating the shadedRepos list for user with id ${req.user._id}.`,
      err
    );
  }

  if (updateRes.ok) {
    res.json({ status: "ok" });
  } else {
    res.json({ status: "not ok" });
  }
}

async function getWhereUsernameStartsWith(req, res) {
  const { q } = req.query;
  let users;
  try {
    users = await UserModel.find(
      {
        username: {
          $regex: `${q}.*`,
        },
      },
      { username: 1, _id: 0 }
    );
  } catch (err) {
    res.send({
      success: false,
      error: `Error getting repos from database.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting from database repos which has the reponame starting with ${q}.`,
      err
    );
  }
  const usersList = users.map((u) => u.username);
  if (usersList.indexOf(req.user.username) !== -1) {
    usersList.splice(usersList.indexOf(req.user.username), 1);
  }
  res.send(usersList);
}

async function getData(req, res) {
  if (req.isAuthenticated()) {
    let userRepos, usersWithSharedRepos, aggregateCharts;
    try {
      userRepos = await RepositoryModel.find({ users: { $eq: req.user._id } });
      usersWithSharedRepos = await UserModel.findById(req.user._id).populate(
        "sharedRepos"
      );

      aggregateCharts = await AggregateChartModel.find({
        user: req.user._id,
      });
    } catch (err) {
      res.send({
        success: false,
        error: `Error getting data from database.`,
      });
      errorHandler(
        `${arguments.callee.name}: Error getting repos, shared repos and aggregate charts from database for user with id ${req.user._id}.`,
        err
      );
    }

    const { sharedRepos, githubId } = usersWithSharedRepos;
    const dataToPlot = {
      userRepos,
      sharedRepos,
      aggregateCharts,
      githubId,
    };

    res.json(dataToPlot);
  } else {
    res.status(404).send("not authenticated");
  }
}

async function getLastXDaysData(user, xDays) {
  let oneMonthAgo = new Date();
  oneMonthAgo.setUTCHours(0, 0, 0, 0);
  oneMonthAgo.setUTCDate(oneMonthAgo.getUTCDate() - xDays);

  let repos;
  try {
    repos = await RepositoryModel.aggregate([
      {
        $match: {
          not_found: false,
          users: { $eq: user._id },
        },
      },
      {
        $project: {
          reponame: true,
          views: {
            data: {
              $filter: {
                input: "$views.data",
                as: "view",
                cond: {
                  $gte: ["$$view.timestamp", oneMonthAgo],
                },
              },
            },
          },
          clones: {
            data: {
              $filter: {
                input: "$clones.data",
                as: "clone",
                cond: {
                  $gte: ["$$clone.timestamp", oneMonthAgo],
                },
              },
            },
          },
          forks: {
            data: {
              $filter: {
                input: "$forks.data",
                as: "fork",
                cond: {
                  $gte: ["$$fork.timestamp", oneMonthAgo],
                },
              },
            },
          },
        },
      },
      {
        $unwind: { path: "$views.data", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          reponame: { $first: "$reponame" },
          views_count: { $sum: "$views.data.count" },
          views_uniques: { $sum: "$views.data.uniques" },
          clones: { $first: "$clones" },
          forks: { $first: "$forks" },
        },
      },
      {
        $unwind: { path: "$clones.data", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          reponame: { $first: "$reponame" },
          views_count: { $first: "$views_count" },
          views_uniques: { $first: "$views_uniques" },
          clones_count: { $sum: "$clones.data.count" },
          clones_uniques: { $sum: "$clones.data.uniques" },
          forks: { $first: "$forks" },
        },
      },
      {
        $unwind: { path: "$forks.data", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          reponame: { $first: "$reponame" },
          views_count: { $first: "$views_count" },
          views_uniques: { $first: "$views_uniques" },
          clones_count: { $first: "$clones_count" },
          clones_uniques: { $first: "$clones_uniques" },
          forks_count: { $sum: "$forks.data.count" },
        },
      },
    ]);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all repos from database.`,
      err
    );
    return { success: false, data: [] };
  }

  return { success: true, data: repos };
}

async function checkForNewRepos(user, token) {
  let anyNewRepo = false;

  /* Get all repos for a user through GitHub API */
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
    logger.warn(
      `${arguments.callee.name}: GitHubApiCtrl.getUserRepos failed with code ${githubRepos.status}`
    );
    return;
  }

  if (githubRepos.data === undefined) {
    return;
  }

  const updateReposPromises = githubRepos.data.map(async (githubRepo) => {
    let repos;
    try {
      repos = await RepositoryModel.find({
        github_repo_id: String(githubRepo.id),
        not_found: false,
      });
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught while getting repo from database with GitHub repo id ${githubRepo.id}.`,
        err
      );
      success = false;
    }

    if (repos === undefined) {
      return;
    }

    if (repos.length === 0) {
      anyNewRepo = true;

      let newRepo;
      try {
        newRepo = await RepositoryCtrl.createRepository(
          githubRepo,
          user._id,
          token
        );
      } catch (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught while creating new repository in database with GitHub repo id ${githubRepo.id}.`,
          err
        );
      }

      if (!newRepo.success) {
        logger.warn(
          `${arguments.callee.name}: Fail creating new repository in database with GitHub repo id ${githubRepo.id}`
        );
        return;
      }

      try {
        await newRepo.data.save();
      } catch (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught while saving the new repository in database with GitHub repo id ${githubRepo.id}.`,
          err
        );
      }
    } else if (repos.length === 1) {
      const repo = repos[0];

      /* Update repository name if changed */
      if (repo.reponame !== githubRepo.full_name) {
        repo.nameHistory.push({
          date: new Date(),
          change: `${repo.reponame} -> ${githubRepo.full_name}`,
        });
        repo.reponame = githubRepo.full_name;
        anyNewRepo = true;
      }

      /* Update users list if needed */
      const foundedUserId = repo.users.find(
        (userId) => String(userId) === String(user._id)
      );

      if (foundedUserId === undefined) {
        repo.users.push(user._id);
      }

      /* Save changes to the repo in database */
      try {
        await repo.save();
      } catch (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught while updating repository in database with GitHub repo id ${repo.github_repo_id}.`,
          err
        );
      }
    } else {
      /* More than one element was found -> log an error */
      logList = repos.map((r) => [r.reponame, user.username, r.github_repo_id]);
      logger.warn(`Found more repos with the same name in database ${logList}`);
    }
  });
  try {
    await Promise.all(updateReposPromises);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while updating repositories for user ${user.username}.`,
      err
    );
  }

  return anyNewRepo;
}

async function sync(req, res) {
  const { user } = req;
  let t;
  try {
    t = await TokenModel.findOne({ _id: user.token_ref });
  } catch (err) {
    res.send({
      success: false,
      error: `Error getting data from database.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught while getting token for user ${user.username}.`,
      err
    );
  }

  let success;
  try {
    success = await checkForNewRepos(user, t.value);
  } catch (err) {
    res.send({
      success: false,
      error: `Error sync.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught while checking for new repos for user ${user.username}.`,
      err
    );
  }

  if (success) {
    getData(req, {
      json: (data) => {
        res.json({ status: "ok", data });
      },
    });
  } else {
    res.json({ status: "ok" });
  }
}

module.exports = {
  updateProfile,
  getWhereUsernameStartsWith,
  getData,
  getLastXDaysData,
  sync,
  unfollowSharedRepo,
  checkForNewRepos,
};
