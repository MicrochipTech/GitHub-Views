const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const TokenModel = require("../models/Token");
const GitHubApiCtrl = require("./GitHubApiCtrl");
const RepositoryCtrl = require("../controllers/RepositoryCtrl");

async function unfollowSharedRepo(req, res) {
  const { repoId } = req.body;
  const updateRes = await UserModel.update(
    { _id: req.user._id },
    { $pull: { sharedRepos: repoId } }
  );
  console.log(updateRes);
  if (updateRes.ok) {
    res.json({ status: "ok" });
  } else {
    res.json({ status: "notok:(" });
  }
}

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
  let anyNewRepo = false;

  /* Get all repos for a user through GitHub API */
  const githubRepos = await GitHubApiCtrl.getUserRepos(user, token).catch(e => {
    console.log(
      `checkForNewRepos ${user.username}: error getting user repos`,
      e
    );
    if (
      e.response.status === 403 &&
      e.response.headers["x-ratelimit-remaining"] === "0"
    ) {
      console.log("Forbidden. No more remaining requests");
    }
  });

  if (githubRepos === undefined) {
    return;
  }

  const updateReposPromises = githubRepos.map(async githubRepo => {
    const repos = await RepoModel.find({
        github_repo_id: String(githubRepo.id),
        not_found: false
      }).catch(() => {
        console.log(`checkForNewRepos ${user}: Error getting repos`);
        success = false;
      });

    if(repos === undefined) {
        return;
    }

    if (repos.length === 0) {
      anyNewRepo = true;

      const newRepo = await RepositoryCtrl.createRepository(
        githubRepo,
        user._id,
        token
      ).catch(e => {
        console.log(e, `checkForNewRepos ${user}: error creating a new repo`);
      });

      newRepo.save();
    } else if (repos.length === 1) {
      const repo = repos[0];

      /* Update repository name if changed */
      if (repo.reponame !== githubRepo.full_name) {
        repo.reponame = githubRepo.full_name;
        anyNewRepo = true;
      }

      /* Update users list if needed */
      const foundedUserId = repo.users.find(
        /* Comparison needs check */
        userId => userId === user._id
      );

      if(foundedUserId === undefined) {
          repo.users.push(user._id);
      }

      /* Save changes to the repo in database */
      await repo.save();
    } else {
        /* More than one element was found -> log an error */
        logList = repos.map(r => [r.reponame, r.user.username, r.github_repo_id])
        console.log(`Found more repos with the same name in database ${logList}`);
    }
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
  sync,
  unfollowSharedRepo,
  checkForNewRepos
};
