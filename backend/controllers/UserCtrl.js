const UserModel = require("../models/User");
const RepoModel = require("../models/Repository");
const AggregateChartModel = require("../models/AggregateChart");
const RepositoryModel = require("../models/Repository");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");

function updateTraffic(repo, views) {
  let viewsToUpdate = views;
  if (repo.views.length !== 0) {
    const last = repo.views[repo.views.length - 1].timestamp;
    viewsToUpdate = viewsToUpdate.filter(info => {
      const timestampDate = new Date(info.timestamp);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      if (
        timestampDate.getTime() > last.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  }

  repo.views.push(...viewsToUpdate);
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

  syncRepos: async (user, token, updateTraffic=true) => {
    const success = true;

    if ( token === undefined ) {
      token = user.token_ref.value
    }

    /* Check for renamed and deleted repositories */
    const localRepos = await RepositoryModel
      .find({ user_id: user._id })
      .catch(e => {
        console.log(`syncRepos ${user}: Error getting repos`);
        success = false;
      });

    const localReposPromises = localRepos.map(async repoEntry => {
      if (!repoEntry.not_found && token) {
  
        const { response: trafficResponse, response_json: traffic } = await GitHubApiCtrl.getRepoTraffic(
          repoEntry.reponame,
          token
        ).catch(e => {
          console.log(`syncRepos ${user}: Error getting repo traffic for ${repoEntry.reponame}`);
          success = false;
        });
  
        if (traffic) {
          switch(trafficResponse.status) {
            case 404:
              /* The repository was not found */
              repoEntry.not_found = true;
              break;
  
            case 301:
              /* The repository was renamed */
              const { response_json: repoDetails } = await GitHubApiCtrl.getRepoDetailsById(
                repoEntry.github_repo_id,
                token
              ).catch(e => {
                console.log(`syncRepos ${user}: Error getting repository details for repo ${repoEntry.github_repo_id}`);
                success = false;
              });
              
              if(repoDetails){
                repoEntry.reponame = repoDetails.full_name;
              } else {
                console.log(`syncRepos ${user}: Error trying to rename ${repoEntry.reponame}`);
                success = false;
              }
  
              if(updateTraffic){
                const { response: redirectResponse, response_json: redirectTraffic } = await GitHubApiCtrl.getRepoTraffic(
                  repoEntry.reponame,
                  token
                );
    
                if(redirectResponse.status != 200 || !redirectTraffic) {
                  console.log(`syncRepos ${user}: Error trying to update repository ${repoEntry.reponame}`);
                  success = false;
                }
    
                updateTraffic(repoEntry, redirectTraffic.views);
              }
              break;
  
            case 200:
              /* The repository exists and will be updated */
              if(updateTraffic){
                updateTraffic(repoEntry, traffic.views);
              }
              break;

            default:
              console.log(`syncRepos ${user}: Error unknown response code`);
          }
          await repoEntry.save();
        }
      }
    });
    Promise.all(localReposPromises);

    /* Checking for new repositories on GitHub */
    const githubRepos = await GitHubApiCtrl.getUserRepos(
      user,
      token
    ).catch(e => {
      console.log(`syncRepos ${user}: error getting user repos`);
      success = false;
    });

    if (githubRepos) {
      githubReposPromises = githubRepos.map(async repo => {
        const repoEntry = await RepositoryModel.findOne({
          reponame: repo.full_name,
          user_id: user._id
        }).catch(e => {
          console.log(`syncRepos ${user}: error getting repo ${repo.full_name}`);
          success = false;
        });

        if (repoEntry === null) {
          await GitHubApiCtrl.createNewUpdatedRepo(
            repo,
            user._id,
            token
          ).catch(e => {
            console.log(`syncRepos ${user}: error creating a new repo`);
            success = false;
          });
        }
      });
      Promise.all(githubReposPromises);
    }
    return success;
  }
};
