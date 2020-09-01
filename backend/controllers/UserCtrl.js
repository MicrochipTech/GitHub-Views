const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");

async function unfollowSharedRepo(req, res) {
  const { repoId } = req.body;
  let updateRes;
  try {
    updateRes = await UserModel.update(
      { _id: req.user._id },
      { $pull: { sharedRepos: repoId } });
  } catch(err) {
    // TODO
  }
  console.log(updateRes);
  if (updateRes.ok) {
    res.json({ status: "ok" });
  } else {
    res.json({ status: "notok:(" });
  }
}

async function getWhereUsernameStartsWith(req, res) {
  const { q } = req.query;
  let users;
  try {
    users = await UserModel.find(
      {
        username: {
          $regex: `${q}.*`
        }
      },
      { username: 1, _id: 0 });
  } catch(err) {
    // TODO
  }
  const usersList = users.map(u => u.username);
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
      usersWithSharedRepos = await UserModel.findById(
          req.user._id
        ).populate("sharedRepos");
      
      aggregateCharts = await AggregateChartModel.find({
        user: req.user._id
      });
    } catch(err) {
      // TODO
    }

    const { sharedRepos, githubId } = usersWithSharedRepos;
    const dataToPlot = {
      userRepos,
      sharedRepos,
      aggregateCharts,
      githubId
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
  } catch(err) {
    // TODO
  }

  if (githubRepos.success === false) {
    console.log(
      "ERROR: UserCtrl.js: GitHubApiCtrl.getUserRepos failed with code ",
      githubRepos.status
    );
    return;
  }

  if (githubRepos.data === undefined) {
    return;
  }

  const updateReposPromises = githubRepos.data.map(async githubRepo => {
    let repos;
    try {
      repos = await RepoModel.find(
        {
          github_repo_id: String(githubRepo.id),
          not_found: false
        });
    } catch(err) {
      console.log(`checkForNewRepos ${user}: Error getting repos`);
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
      } catch(err) {
        // TODO
      }

      if (!newRepo.success) {
        console.log("UserCtrl.js:checkForNewRepos error");
        return;
      }

      try {
        await newRepo.data.save();
      } catch(err) {
        // TODO
      }
    } else if (repos.length === 1) {
      const repo = repos[0];

      /* Update repository name if changed */
      if (repo.reponame !== githubRepo.full_name) {
        repo.nameHistory.push({
          date: new Date(),
          change: `${repo.reponame} -> ${githubRepo.full_name}`
        });
        repo.reponame = githubRepo.full_name;
        anyNewRepo = true;
      }

      /* Update users list if needed */
      const foundedUserId = repo.users.find(
        userId => String(userId) === String(user._id)
      );

      if (foundedUserId === undefined) {
        repo.users.push(user._id);
      }

      /* Save changes to the repo in database */
      try {
        await repo.save();
      } catch(err) {
        // TODO
      }
    } else {
      /* More than one element was found -> log an error */
      logList = repos.map(r => [r.reponame, user.username, r.github_repo_id]);
      console.log(`Found more repos with the same name in database ${logList}`);
    }
  });
  try {
    await Promise.all(updateReposPromises);
  } catch(err) {
    // TODO
  }

  return anyNewRepo; 
}

async function sync(req, res) {
  const { user } = req;
  let t;
  try {
    t = await TokenModel.findOne({ _id: user.token_ref });
  } catch(err) {
    // TODO
  }

  let success;
  try {
    success = await checkForNewRepos(user, t.value);
  } catch(err) {
    // TODO
  }

  if (success) {
    getData(req, {
      json: data => {
        res.json({ status: "ok", data });
      }
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
  checkForNewRepos
};
