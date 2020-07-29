const router = require("express").Router();
const fetch = require("node-fetch");
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const indexCtrl = require("../controllers/IndexCtrl");
const { updateRepositories } = require("../config/cron-setup");
const RepositoryModel = require("../models/Repository");
const { db } = require("../models/Repository");

router.get("/", indexCtrl.home);
router.get("/forceUpdate", async (req, res) => {
  await updateRepositories();
  res.send("ok");
});

// OLD function used in updating repoid and notfound
async function getRepoTrafficOld(reponame, token) {
    const response = await fetch(`https://api.github.com/repos/${reponame}`, {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }).catch(() => console.log(`getRepoTrafficOld ${reponame}: error`));
  
    const responseJson = await response.json();
  
    return { response, responseJson };
}

// END OLD function
router.get("/update_db", async (req, res) => {
    /* BEGIN - update repoid and not_found */
    console.log("Updating repoid and not_found fields");
  
    const repos = await RepositoryModel.find().populate({
      path: "user_id",
      populate: { path: "token_ref" }
    });
  
    const idUpdatePromises = repos.map(async repoEntry => {
      if (repoEntry.user_id.token_ref) {
        //   console.log(repoEntry.user_id.token_ref.value);
        const {
          response: repoDetailsResponse,
          responseJson: repoDetails
        } = await getRepoTrafficOld(
          repoEntry.reponame,
          repoEntry.user_id.token_ref.value
        ).catch(e =>
          console.log(
            "Updating repoid and not_found fields: Error getting repo traffic",
            e
          )
        );
  
        //console.log(JSON.stringify(repoDetailsResponse), JSON.stringify(repoDetails))
  
        if (repoDetails) {
          switch (repoDetailsResponse.status) {
            case 404:
              /* Mark the repository as not found */
              repoEntry.not_found = true;
  
              break;
  
            case 301: {
              /* The repository was renamed */
  
              const redirectDetailsResponse = await fetch(repoDetails.url, {
                method: "get",
                redirect: "manual",
                headers: {
                  Authorization: `token ${repoEntry.user_id.token_ref.value}`
                }
              }).catch(() =>
                console.log(
                  "Updating repoid and not_found fields: Error after redirect"
                )
              );
              const redirectDetails = await redirectDetailsResponse.json();
  
              if (redirectDetails) {
                repoEntry.not_found = false;
                repoEntry.github_repo_id = redirectDetails.id;
              } else {
                console.log(
                  `Error trying to update github_id and not_found fields for ${repoEntry.reponame}`
                );
              }
  
              break;
            }
            case 200:
              /* The repository exists and will be updated */
              repoEntry.not_found = false;
              repoEntry.github_repo_id = repoDetails.id;
  
              break;
  
            default:
              console.log(
                "Error updateing repoid and not_found fields: ",
                repoDetailsResponse.status,
                repoEntry.user_id.username
              );
          }
          repoEntry.clones.total_uniques = repoEntry.clones.total_count = 0;
          await repoEntry.save();
          console.log(`${repoEntry.reponame} - ${repoEntry.github_repo_id} `);
        }
      }
    });
    await Promise.all(idUpdatePromises);
    /* END - update repoid and not_found */
    res.send("ok");
});

function oldestRepo(r1, r2) {
    if(r1.views.length === 0)
        return r2;

    if(r2.views.length === 0)
        return r1;

    if(new Date(r1.views[0].timestamp).getTime() > new Date(r2.views[0].timestamp).getTime())
        return r2;
    else
        return r1;
}

router.get("/migrate_db", async (req, res) => {
  /*
  allepos
  forEach repo in allrepos
    MINIMAL:
    repo.users.push(repo.user_id)
    repo.save()

    FULL IMPLEMENTATION:
    duplicates = allreposo find where r.id == repo.id
    oldest_duplicate = duplicates where views[0].timestamp is olders
    oldest_duplicate.users =  [...duplicates.user_id]
    (duplicates = oldest_duplicate).delete()
    //oldest_duplicate.user_id = null
    oldest_duplicate.save()
    all_repos -= duplicates
  */

    const uniqueReponames = [];

    const repos = await RepositoryModel.find({}).populate('user_id').catch(() => {
        console.log(`syncRepos: error getting repo ${repo.full_name}`);
    });

    for(let i = 0; i < repos.length; i += 1) {
        const element = repos[i];

        const repoProcessed = uniqueReponames.find(
            reponame => reponame === element.reponame
        );

        if(repoProcessed) {
            /* This repo already exists in database */
            continue;
        }

        const duplicates = repos.filter(repo => repo.reponame === element.reponame);
        const oldestDuplicate = duplicates.reduce((acc, el) => oldestRepo(acc, el), duplicates[0]);

        if(oldestDuplicate.github_repo_id === undefined) {
            const repoWithGithubRepoId = duplicates.find(d => d.github_repo_id !== undefined);
            
            if(repoWithGithubRepoId === undefined) {
                console.log(`ERROR removing duplicates for Reponame: ${oldestDuplicate.reponame}, User: ${oldestDuplicate.user_id.username}`);
                continue;
            }

            oldestDuplicate.github_repo_id = repoWithGithubRepoId.github_repo_id;
        }

        oldestDuplicate.users = duplicates.map(d => d.user_id);

        uniqueReponames.push(element.reponame);

        const dbUpdatePromises = duplicates.map(async d => {
            if(d._id === oldestDuplicate._id) {
                await d.save();
            } else {
                await d.remove();
            }
        });
        await Promise.all(dbUpdatePromises);
    }
    
    res.send("ok");
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
