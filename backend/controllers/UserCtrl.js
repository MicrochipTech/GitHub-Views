const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const RepositoryModel = require("../models/Repository");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");

function updateRepoTraffic(repo, traffic) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  /* Update views */

  let viewsToUpdate = traffic.views;
  if (repo.views.length !== 0) {
    const lastViewTimestamp = repo.views[repo.views.length - 1].timestamp;
    viewsToUpdate = viewsToUpdate.filter(info => {
      const timestampDate = new Date(info.timestamp);

      if (
        timestampDate.getTime() > lastViewTimestamp.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  }

  repo.views.push(...viewsToUpdate);

  /* Update clones */
  
  let clonesToUpdate = traffic.clones;
  if (repo.clones.data.length !== 0) {
    const lastCloneTimestamp = repo.clones.data[repo.clones.data.length - 1].timestamp;
    clonesToUpdate = clonesToUpdate.filter(info => {
      const timestampDate = new Date(info.timestamp);

      if (
        timestampDate.getTime() > lastCloneTimestamp.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  }

  repo.clones.total_count += clonesToUpdate.reduce((accumulator, currentClone) => accumulator + currentClone.count, 0);
  repo.clones.total_uniques += clonesToUpdate.reduce((accumulator, currentClone) => accumulator + currentClone.uniques, 0);
  repo.clones.data.push(...clonesToUpdate);
}

async function updateRepoName(repo, token) {
  const {
    response_json: repoDetails
  } = await GitHubApiCtrl.getRepoDetailsById(
    repo.github_repo_id,
    token
  ).catch(e => {
    console.log(
      `syncRepos ${user}: Error getting repository details for repo ${repo.github_repo_id}`
    );
    return false;
  });

  if (repoDetails) {
    repo.reponame = repoDetails.full_name;
  } else {
    console.log(
      `syncRepos ${user}: Error trying to rename ${repo.reponame}`
    );
    return false;
  }

  //await repo.save(); /* Should it be saved here? */
  return true; /* The repository was renamed */
}

async function updateRepo(repo, token, recurssiveDepth = 2) {
  if (recurssiveDepth == 0) {
    /* If the repository was renamed, the update will require one more call */
    console.log(
      `updateRepo ${repo.reponame}: Too much recursive calls.`
    );
    return false;
  }

  const {
    response: trafficResponse,
    responseJson: traffic
  } = await GitHubApiCtrl.getRepoTraffic(repo.reponame, token).catch(
    (e) => {
      console.log(
        `updateRepo: Error getting repo traffic for ${repo.reponame}`
      );
      return false;
    }
  );

  if (!traffic) {
    return false;
  }

  switch (trafficResponse) {
    case 404:
      /* The repository was not found */
      repo.not_found = true;
      await repo.save();
      return true;

    case 301:
      /* The repository was renamed */
      if(!updateRepoName(repo, token)) {
        return false;
      }
      return updateRepo(repo, token, recurssiveDepth - 1);

    case 200:
      updateRepoTraffic(repo, traffic);
      await repo.save();
      return true;

    default:
      console.log(`syncRepos ${user}: Error unknown response code`);
      return false;
  }
}


module.exports = {
  getWhereUsernameStartsWith: async (req, res) => {
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
  },

  getData: async (req, res) => {
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
  },

  syncRepos: async (user, token) => {
    let success = true;

    /* Check for renamed and deleted repositories */
    const localRepos = await RepositoryModel.find({ user_id: user._id }).catch(
      () => {
        console.log(`syncRepos ${user}: Error getting repos`);
        success = false;
      }
    );

    const localReposPromises = localRepos.map(async repoEntry => {
      if (!repoEntry.not_found /*&& token*/) {
        updateRepo(repoEntry, token);
      }
    });
    Promise.all(localReposPromises);

    /* Checking for new repositories on GitHub */
    const githubRepos = await GitHubApiCtrl.getUserRepos(user, token).catch(
      () => {
        console.log(`syncRepos ${user}: error getting user repos`);
        success = false;
      }
    );

    if (githubRepos) {
      const githubReposPromises = githubRepos.map(async repo => {
        const repoEntry = await RepositoryModel.findOne({
          reponame: repo.full_name,
          user_id: user._id
        }).catch(() => {
          console.log(
            `syncRepos ${user}: error getting repo ${repo.full_name}`
          );
          success = false;
        });

        if (repoEntry === null) {
          await GitHubApiCtrl.createNewUpdatedRepo(repo, user._id, token).catch(
            (e) => {
              console.log(e, `syncRepos ${user}: error creating a new repo`);
              success = false;
            }
          );
        }
      });
      Promise.all(githubReposPromises);
    }
    return success;
  }
};
