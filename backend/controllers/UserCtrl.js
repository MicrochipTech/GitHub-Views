const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");
const { logger, errorHandler } = require("../logs/logger");
const { getRepoViews } = require("./GitHubApiCtrl");

const getRepoWithTrafficBetween = require("../mongoQueries/getRepoWithTrafficBetween");
const getRepoDataBetween = require("../mongoQueries/getUserReposWithTrafficBetween");
const getUserSharedReposWithTrafficBetween = require("../mongoQueries/getUserSharedReposWithTrafficBetween");
const getUserReposForLastXDays = require("../mongoQueries/getUserReposForLastXDays");

const mongoose = require("mongoose");

async function updateProfile(user) {
  const t = await TokenModel.findOne({ _id: user.token_ref });
  let userDetails, userEmails;

  try {
    userDetails = await GitHubApiCtrl.getUserProfile(t.value);
    userEmails = await GitHubApiCtrl.getUserEmails(t.value);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting from GitHub API emails or details for user with _id ${user._id}.`,
      err
    );
    return false;
  }

  if (userDetails === undefined || userEmails === undefined) {
    logger.warn(
      `Fail when getting from GitHub API emails or details for user with _id ${user._id}.`
    );
    return false;
  }
  if (!userDetails.success || !userEmails.success) {
    logger.warn(
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

async function getDataSingleRepo(req, res) {
  const repo = await RepositoryModel.findOne({
    _id: req.params.id,
    users: { $eq: req.user._id },
  });
  res.json(repo);
}

async function getData(req, res) {
  if (req.isAuthenticated()) {
    const { repo_id, start, end } = req.query;

    const dateStart = new Date(start);
    const dateEnd = new Date(end);

    function isValidDate(d) {
      return d instanceof Date && !isNaN(d);
    }

    if (repo_id) {
      let repoWithTraffic;
      try {
        if (dateStart && dateEnd) {
          const repoWithTrafficRes = await getRepoBetween(
            repo_id,
            dateStart,
            dateEnd
          );
          if (repoWithTrafficRes.success === fasle) {
            res.send({
              success: false,
              error: `Error getting data.`,
            });
            return;
          }

          repoWithTraffic = repoWithTrafficRes.data;
        } else {
          repoWithTraffic = await RepositoryModel.findOne({
            _id: repo_id,
          });
        }
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
      res.json({ success: true, repoWithTraffic });
    } else {
      let userRepos, usersWithSharedRepos, aggregateCharts;
      try {
        if (isValidDate(dateStart) && isValidDate(dateEnd)) {
          const userReposRes = await getUserReposBetween(
            req.user._id,
            dateStart,
            dateEnd
          );

          if (userReposRes.success === false) {
            res.send({
              success: false,
              error: `Error getting data.`,
            });
            return;
          }
          userRepos = userReposRes.data;

          console.log("dateStart, dateEnd: ", dateStart, dateEnd);

          const usersWithSharedReposRes = await getUserAndPopulateSharedReposBetween(
            req.user._id,
            dateStart,
            dateEnd
          );

          if (usersWithSharedReposRes.success === false) {
            res.send({
              success: false,
              error: `Error getting data.`,
            });
            return;
          }

          // console.log(
          //   "usersWithSharedReposRes.data: ",
          //   JSON.stringify(usersWithSharedReposRes.data, null, 2)
          // );

          usersWithSharedRepos = usersWithSharedReposRes.data;

          aggregateCharts = await AggregateChartModel.find({
            user: req.user._id,
          });
        } else {
          const user_id = req.user._id;

          userRepos = await RepositoryModel.find(
            {
              users: { $eq: user_id },
            },
            {
              content: 0,
              referrers: 0,
            }
          );

          usersWithSharedRepos = await UserModel.findById(user_id).populate(
            "sharedRepos"
          );

          aggregateCharts = await AggregateChartModel.find({
            user: user_id,
          });
        }
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

      res.json({ success: true, dataToPlot });
    }
  } else {
    res.status(404).send("not authenticated");
  }
}

async function getRepoBetween(repo_id, dateStart, dateEnd) {
  if (!repo_id) {
    return { success: false };
  }

  let repos;
  try {
    repos = await RepositoryModel.aggregate(
      getRepoWithTrafficBetween(repo_id, dateStart, dateEnd)
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all repos from database.`,
      err
    );
    return { success: false };
  }

  if (repo.length !== 1) {
    return { success: false };
  }

  return { success: true, data: repos[0] };
}

async function getUserReposBetween(user_id, dateStart, dateEnd) {
  if (!user_id) {
    return { success: false, data: [] };
  }

  let repos;
  try {
    repos = await RepositoryModel.aggregate(
      getRepoDataBetween(
        {
          not_found: false,
          users: { $eq: user_id },
        },
        dateStart,
        dateEnd
        // new Date("Mon, 31 Aug 2020 21:00:00 GMT"),
        // new Date("Thu, 01 Oct 2020 20:59:59 GMT")
      )
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all repos from database.`,
      err
    );
    return { success: false, data: [] };
  }

  return { success: true, data: repos };
}

async function getUserAndPopulateSharedReposBetween(
  user_id,
  dateStart,
  dateEnd
) {
  if (!user_id) {
    return { success: false };
  }

  let users;
  try {
    users = await UserModel.aggregate(
      getUserSharedReposWithTrafficBetween(user_id, dateStart, dateEnd)
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught while getting all repos from database.`,
      err
    );
    return { success: false };
  }

  if (users.length !== 1) {
    logger.warn(`${arguments.callee.name}: Error expected.`);
    return { success: false };
  }

  return { success: true, data: users[0] };
}

async function getLastXDaysData(user, xDays) {
  if (!user) {
    return { success: false, data: [] };
  }

  let oneMonthAgo = new Date();
  oneMonthAgo.setUTCHours(0, 0, 0, 0);
  oneMonthAgo.setUTCDate(oneMonthAgo.getUTCDate() - xDays);

  let repos;
  try {
    repos = await RepositoryModel.aggregate(
      getUserReposForLastXDays(user, xDays)
    );
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
  getDataSingleRepo,
};
