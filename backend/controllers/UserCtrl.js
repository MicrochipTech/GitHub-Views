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

  /* Update referrers */
  traffic.referrers.forEach(data => {
    foundReferrer = repo.referrers.find(r => r.name === data.referrer);
    if(foundReferrer) {
      /* The referrer is already in database */
      foundReferrer.data.push({
        timestamp: today.toISOString(),
        count: data.count,
        uniques: data.uniques
      });
    } else {
      /* Add the new referrer in database */
      repo.referrers.push({
        name: data.referrer,
        data: [
          {
            timestamp: today.toISOString(),
            count: data.count,
            uniques: data.uniques
          }
        ]
      });
    }
  });

  /* Update content */
  traffic.contents.forEach(data => {
    foundContent = repo.contents.find(c => c.path === data.path);
    if(foundContent) {
      /* The content is already in database */
      foundContent.data.push({
        timestamp: today.toISOString(),
        count: data.count,
        uniques: data.uniques
      })
    } else {
      /* Add the new content in database */
      repo.contents.push({
        path: data.path,
        title: data.title,
        data: [
          {
            timestamp: today.toISOString(),
            count: data.count,
            uniques: data.uniques
          }
        ]
      })
    }
  });

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
        e,
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

  syncRepos: async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const repos = await RepositoryModel.find({not_found: false}).catch(() => {
      console.log(
        `syncRepos ${user}: error getting repo ${repo.full_name}`
      );
    });

    /* 
     * Before updating, repos mark them as not updated.
     * After update, if it is still marked as not updated, it means it was deleted.
     */
    repos.forEach(repo => { repo.not_found = true });

    const users = await UserModel.find({
      githubId: { $ne: null },
      token_ref: { $exists: true }
    }).populate("token_ref");
  
    const userPromises = users.map(async user => {

      const token = user.token_ref.value;
      /* Get all repos for a user through GitHub API */
      const githubRepos = await GitHubApiCtrl.getUserRepos(user, token).catch(
        () => {
          console.log(`syncRepos ${user}: error getting user repos`);
        }
      );

      /* Get repos from local database */
      const userRepos = repos.filter(repo => repo.user_id.equals(user._id))

      /* TODO githubRepos check */
      const updateReposPromises = githubRepos.map(async githubRepo => {

        const repoEntry = userRepos.find(userRepo => userRepo.github_repo_id === String(githubRepo.id));

        if(repoEntry === undefined) {
          repoEntry = await GitHubApiCtrl.createNewUpdatedRepo(githubRepo, user._id, token).catch(
            (e) => {
              console.log(e, `syncRepos ${user}: error creating a new repo`);
            }
          );
        } else {
          /* The repository still exists on GitHub*/
          repoEntry.not_found = false;

          /* Update repository name if changed */
          if(repoEntry.reponame !== githubRepo.full_name) {
            repoEntry.reponame = githubRepo.full_name;
          }

          /* Update forks */
          repoEntry.forks.tree_updated = false;
          if(repoEntry.forks.data[repoEntry.forks.data.length - 1].count !== githubRepo.forks_count) {
            repoEntry.forks.data.push({
              timestamp: today.toISOString(),
              count: githubRepo.forks_count
            });
          }

          /* Test updateTree */
          const {status: treeStatus, data: treeData} = await GitHubApiCtrl.updateForksTree(repoEntry.github_repo_id).catch(
            () => {
              console.log(`Error updateForksTree on repo: ${repoEntry.reponame}`);
            }
          );

          if(treeStatus === false){
            console.log(`Tree not updated for repo: ${repoEntry.reponame}`);
          }
          /* end test */

          /* Update traffic */
          const traffic = await GitHubApiCtrl.getRepoTraffic(repoEntry.reponame, token);
          updateRepoTraffic(repoEntry, traffic);
        }
        repoEntry.save();
      });
      await Promise.all(updateReposPromises);
    });
    await Promise.all(userPromises);
  },

  syncReposOLD: async (user, token) => {
    let success = true;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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
    await Promise.all(localReposPromises);

    const usart = await RepoModel.findOne({ github_repo_id: "162296155" }).catch(
      () => {
        console.log("get uart");
      }
    );

    const {success: treeStatus, data: treeData} = await GitHubApiCtrl.updateForksTree(usart.github_repo_id).catch(
      (e) => {
        console.log("????", e);
      }
    );

    if(treeStatus === true) {
      usart.forks.children = treeData;
    } else {
      console.log("FAIL " + treeData);
    }

    console.log(".................")
    console.log(JSON.stringify(usart.forks.children));
    console.log(".................")
    usart.update();

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
          github_repo_id: repo.id,
          user_id: user._id
        }).catch(() => {
          console.log(
            `syncRepos ${user}: error getting repo ${repo.full_name}`
          );
          success = false;
        });

        /* Create the new repository in local database */
        if (repoEntry === null) {
          /* createNewUpdatedRepo changed. It returns the created repo object */
          await GitHubApiCtrl.createNewUpdatedRepo(repo, user._id, token).catch(
            (e) => {
              console.log(e, `syncRepos ${user}: error creating a new repo`);
              success = false;
            }
          );
        } else {

          /* Update repository name if changed */
          if(repoEntry.reponame !== repo.full_name) {
            repoEntry.reponame = repo.full_name;
          }

          /* Update forks */
          repoEntry.forks.tree_updated = false;
          if(repoEntry.forks.data[repoEntry.forks.data.length - 1].count !== repo.forks_count) {
            repoEntry.forks.data.push({
              timestamp: today.toISOString(),
              count: repo.forks_count
            });
          }

          repoEntry.save();
        }
      });
      await Promise.all(githubReposPromises);
    }
    return success;
  }
};
