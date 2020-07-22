const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");

async function getWhereUsernameStartsWith(req, res) {
  const { q } = req.query;
  const users = await UserModel.find(
    {
      username: {
        $regex: `${q}.*`
      }
    },
    { username: 1, _id: 0 }
  );
  const usersList = users.map(u => u.username);
  if (usersList.indexOf(req.user.username) !== -1) {
    usersList.splice(usersList.indexOf(req.user.username), 1);
  }
  res.send(usersList);
}

async function getData(req, res) {
  if (req.isAuthenticated()) {
    const userRepos = await RepoModel.find({ user_id: req.user._id });
    const { sharedRepos, githubId } = await UserModel.findById(
      req.user._id
    ).populate("sharedRepos");
    const aggregateCharts = await AggregateChartModel.find({
      user: req.user._id
    });
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

  // if(token === undefined) {
  //   token = user.token_ref.value;
  // }

  let anyNewRepo = false;

  /* Get all repos for a user through GitHub API */
  const githubRepos = await GitHubApiCtrl.getUserRepos(user, token).catch(
    e => {
      console.log(`checkForNewRepos ${user.username}: error getting user repos`, e);
      if (
        e.response.status === 403 &&
        e.response.headers["x-ratelimit-remaining"] === "0"
      ) {
        console.log("Forbidden. No more remaining requests");
      }
    }
  );

  /* Get repos from local database */
  const userRepos = await RepoModel.find({ user_id: user._id, not_found: false }).catch(
    () => {
      console.log(`checkForNewRepos ${user}: Error getting repos`);
      success = false;
    }
  );

  if (githubRepos === undefined) {
    return;
  }

  const updateReposPromises = githubRepos.map(async githubRepo => {
    let repoEntry = userRepos.find(
      userRepo => userRepo.github_repo_id === String(githubRepo.id)
    );

    if (repoEntry === undefined) {
      anyNewRepo = true;

      repoEntry = await RepositoryCtrl.createRepository(
        githubRepo,
        user._id,
        token
      ).catch(e => {
        console.log(e, `checkForNewRepos ${user}: error creating a new repo`);
      });
    } else {
      /* Update repository name if changed */
      if (repoEntry.reponame !== githubRepo.full_name) {
        repoEntry.reponame = githubRepo.full_name;
      }
    }

    await repoEntry.save();
  });
  await Promise.all(updateReposPromises);

  return anyNewRepo;
}

async function sync(req, res) {
  const { user } = req;
  const t = await TokenModel.findOne({ _id: user.token_ref });

  const success = await checkForNewRepos(user, t.value);

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
  sync
};
