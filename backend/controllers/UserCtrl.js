const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const {logger, errorHandler} = require("../logs/logger");

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
      userRepos = await RepoModel.find({ users: { $eq: req.user._id } });
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
    logger.info(
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
      repos = await RepoModel.find({
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
        logger.info(
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
      logger.info(`Found more repos with the same name in database ${logList}`);
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
  getWhereUsernameStartsWith,
  getData,
  sync,
  unfollowSharedRepo,
  checkForNewRepos,
};
