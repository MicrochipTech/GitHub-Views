const router = require("express").Router();
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const indexCtrl = require("../controllers/IndexCtrl");

router.get("/", indexCtrl.home);
const RepositoryModel = require("../models/Repository");
const fetch = require("node-fetch")
// OLD function used in updating repoid and notfound
async function getRepoTrafficOld(reponame, token) {
    const response = await fetch(
      `https://api.github.com/repos/${reponame}`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`
        }
      }
    ).catch(() => console.log(`getRepoTrafficOld ${reponame}: error`));
  
    const responseJson = await response.json();
  
    return { response, responseJson };
  }
  // END OLD function
router.get("/migrate_db", async (req, res) => {
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
      ).catch((e) =>
        console.log(
          "Updating repoid and not_found fields: Error getting repo traffic",e
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
            console.log("Error updateing repoid and not_found fields: ", repoDetailsResponse.status, repoEntry.user_id.username);
        }
        repoEntry.clones.total_uniques = repoEntry.clones.total_count = 0;
        await repoEntry.save();
        console.log(`${repoEntry.reponame} - ${repoEntry.github_repo_id} `)
      }
    }
  });
  await Promise.all(idUpdatePromises);
  /* END - update repoid and not_found */
    res.send("ok")
})

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
