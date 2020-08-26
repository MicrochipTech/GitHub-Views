const router = require("express").Router();
const fetch = require("node-fetch");
const authRoutes = require("./auth-routes");
const repoRoutes = require("./repo-routes");
const userRoutes = require("./user-routes");
const aggregateChartsRoutes = require("./aggregateCharts-routes");
const indexCtrl = require("../controllers/IndexCtrl");
const { updateRepositories } = require("../config/cron-setup");
const RepositoryModel = require("../models/Repository");
const { VERSION } = require("../VERSION");

router.get("/VERSION", (req, res) => {
  res.send(VERSION);
});

router.get("/", indexCtrl.home);
router.get("/forceUpdate", async (req, res) => {
  updateRepositories();
  res.send("ok started");
});

function oldestRepo(r1, r2) {
  if (r1.views.length === 0) return r2;

  if (r2.views.length === 0) return r1;

  if (
    new Date(r1.views[0].timestamp).getTime() >
    new Date(r2.views[0].timestamp).getTime()
  )
    return r2;
  else return r1;
}

router.get("/migrate_db", async (req, res) => {
  const allRepos = await RepositoryModel.find({}).populate("user_id");

  const uniqueRepos = [];

  for (let i = 0; i < allRepos.length; i += 1) {
    const element = allRepos[i];

    /* Check if repository was already processed */
    const repoProcessed = uniqueRepos.find(
      (uniqueRepo) => uniqueRepo.reponame === element.reponame
    );

    if (repoProcessed) {
      /* This duplicate repo was already processed */
      console.log(`Repo ${element.reponame} was already processed.`);
      continue;
    }

    /* Get all duplicates */
    const duplicates = allRepos.filter((r) => r.reponame === element.reponame);

    /* Merge views from all duplicates */
    const views = [];
    duplicates.forEach((d) => {
      /* If the views for the current repo is undefined, just skip the repo */
      if (d.views === undefined) {
        return;
      }

      /* If the length of the merged views is zero,
        just add all the elements from the views of the current repo */
      if (views.length === 0) {
        views.push(...d.views);
        return;
      }

      const extraLeftViews = d.views.filter(
        (v) =>
          new Date(v.timestamp).getTime() <
          new Date(views[0].timestamp).getTime()
      );
      views.unshift(...extraLeftViews);

      const extraRightViews = d.views.filter(
        (v) =>
          new Date(v.timestamp).getTime() >
          new Date(views[views.length - 1].timestamp).getTime()
      );
      views.push(...extraRightViews);
    });

    /* Merge clones from all duplicates */
    const clones = [];
    duplicates.forEach((d) => {
      /* If the clones for the current repo is undefined, just skip the repo */
      if (d.clones.data === undefined) {
        return;
      }

      /* If the length of the merged clones is zero,
        just add all the elements from the clones of the current repo */
      if (clones.length === 0) {
        clones.push(...d.clones.data);
        return;
      }

      const extraLeftClones = d.clones.data.filter(
        (c) =>
          new Date(c.timestamp).getTime() <
          new Date(clones[0].timestamp).getTime()
      );
      clones.unshift(...extraLeftClones);

      const extraRightClones = d.clones.data.filter(
        (c) =>
          new Date(c.timestamp).getTime() >
          new Date(clones[clones.length - 1].timestamp).getTime()
      );
      clones.push(...extraRightClones);
    });

    /* Merge forks from all duplicates */
    const forks = [];
    duplicates.forEach((d) => {
      /* If the forks for the current repo is undefined, just skip the repo */
      if (d.forks.data === undefined) {
        return;
      }

      /* If the length of the merged forks is zero,
        just add all the elements from the forks of the current repo */
      if (forks.length === 0) {
        forks.push(...d.forks.data);
        return;
      }

      const extraLeftForks = d.forks.data.filter(
        (f) =>
          new Date(f.timestamp).getTime() <
          new Date(forks[0].timestamp).getTime()
      );
      if (extraLeftForks.length > 0) {
        if (
          forks[0].count === extraLeftForks[extraLeftForks.length - 1].count
        ) {
          forks.shift();
        }
        forks.unshift(...extraLeftForks);
      }

      const extraRightForks = d.forks.data.filter(
        (f) =>
          new Date(f.timestamp).getTime() >
          new Date(forks[forks.length - 1].timestamp).getTime()
      );

      if (extraRightForks.length > 0) {
        if (forks[forks.length - 1].count === extraRightForks[0].count) {
          extraRightForks.shift();
        }
        forks.push(...extraRightForks);
      }
    });

    /* Diff FORKS */
    const reducedForks = forks.reduce((total, currentValue) => {
      const total_count = total.reduce((total, currentValue) => total + currentValue.count, 0);
      
      if(currentValue.count !== total_count) {
        total.push({
          timestamp: currentValue.timestamp,
          count: currentValue.count - total_count
        });
      }
  
      return total;
    }, []);

    /* Merge referrers from all duplicates */
    const referrers = [];
    duplicates.forEach((d) => {
      if (d.referrers === undefined) {
        return;
      }

      d.referrers.forEach((r) => {
        const referrerToUpdate = referrers.find((ref) => ref.name === r.name);

        if (referrerToUpdate === undefined) {
          /* This referrer does not exists in merged list, so we will add it */
          referrers.push({ name: r.name, data: [...r.data] });
          return;
        }

        if (r.data === undefined) {
          /* No data to merge */
          return;
        }

        if (referrerToUpdate.data === undefined) {
          /* Refferer data is undefined, so we will just update it */
          referrerToUpdate.data = r.data;
          return;
        }

        if (referrerToUpdate.data.length === 0) {
          /* Refferer data is empty, so we will just update it */
          referrerToUpdate.data.push(...r.data);
          return;
        }

        const extraLeftRefData = r.data.filter(
          (d) =>
            new Date(d.timestamp).getTime() <
            new Date(referrerToUpdate.data[0].timestamp).getTime()
        );
        referrerToUpdate.data.unshift(...extraLeftRefData);

        const extraRightRefData = r.data.filter(
          (d) =>
            new Date(d.timestamp).getTime() >
            new Date(
              referrerToUpdate.data[referrerToUpdate.data.length - 1].timestamp
            ).getTime()
        );
        referrerToUpdate.data.push(...extraRightRefData);
      });
    });

    /* Merge popular contents from all duplicates */
    const contents = [];
    duplicates.forEach((d) => {
      if (d.contents === undefined) {
        return;
      }

      d.contents.forEach((c) => {
        const contentToUpdate = contents.find(
          (content) => content.path === c.path && content.title === c.title
        );

        if (contentToUpdate === undefined) {
          /* This content does not exists in merged list, so we will add it */
          contents.push({ path: c.path, title: c.title, data: [...c.data] });
          return;
        }

        if (c.data === undefined) {
          /* No data to merge */
          return;
        }

        if (contentToUpdate.data === undefined) {
          /* Content data is empty, so we will just update it */
          contentToUpdate.data = c.data;
          return;
        }

        if (contentToUpdate.data.length === 0) {
          /* Content data is empty, so we will just update it */
          contentToUpdate.data.push(...c.data);
          return;
        }

        const extraLeftContData = c.data.filter(
          (d) =>
            new Date(d.timestamp).getTime() <
            new Date(contentToUpdate.data[0].timestamp).getTime()
        );
        contentToUpdate.data.unshift(...extraLeftContData);

        const extraRightContData = c.data.filter(
          (d) =>
            new Date(d.timestamp).getTime() >
            new Date(
              contentToUpdate.data[contentToUpdate.data.length - 1].timestamp
            ).getTime()
        );
        contentToUpdate.data.push(...extraRightContData);
      });
    });

    const repoWithGithubRepoId = duplicates.find(
      (r) => r.github_repo_id !== undefined
    );
    let github_repo_id = undefined;
    if (repoWithGithubRepoId) {
      github_repo_id = repoWithGithubRepoId.github_repo_id;
    }

    const mergedRepo = {
      not_found: false,
      users: duplicates.map((r) => r.user_id),
      github_repo_id,
      reponame: element.reponame,
      count: views.reduce(
        (total, currentValue) => total + currentValue.count,
        0
      ),
      uniques: views.reduce(
        (total, currentValue) => total + currentValue.uniques,
        0
      ),
      views: views.map((view) => {
        return {
          timestamp: view.timestamp,
          count: view.count,
          uniques: view.uniques,
        };
      }),
      clones: {
        total_count: clones.reduce(
          (total, currentValue) => total + currentValue.count,
          0
        ),
        total_uniques: clones.reduce(
          (total, currentValue) => total + currentValue.uniques,
          0
        ),
        data: clones.map((clone) => {
          return {
            timestamp: clone.timestamp,
            count: clone.count,
            uniques: clone.uniques,
          };
        }),
      },
      forks: {
        tree_updated: false,
        children: [],
        data: reducedForks.map((fork) => {
          return {
            timestamp: fork.timestamp,
            count: fork.count,
          };
        }),
      },
      referrers: referrers.map((referrer) => {
        return {
          name: referrer.name,
          data: referrer.data.map((d) => {
            return {
              timestamp: d.timestamp,
              count: d.count,
              uniques: d.uniques,
            };
          }),
        };
      }),
      contents: contents.map((content) => {
        return {
          path: content.path,
          title: content.title,
          data: content.data.map((d) => {
            return {
              timestamp: d.timestamp,
              count: d.count,
              uniques: d.uniques,
            };
          }),
        };
      }),
    };

    uniqueRepos.push(mergedRepo);
  }

  const dbRemovePromises = allRepos.map((r) => r.remove());
  await Promise.all(dbRemovePromises);

  const dbSavePromises = uniqueRepos.map((r) => new RepositoryModel(r).save());
  await Promise.all(dbSavePromises);

  res.send("ok");
});

router.get("/test_migration", async (req, res) => {
  /* Beggin test */
  let foundDuplicates = false;

  let repos = await RepositoryModel.find({
    /* not_found: false */
  })
    .populate("user_id")
    .catch(() => {
      console.log(`migrate_db test: error getting repo ${repo.full_name}`);
    });

  while (repos.length > 0) {
    const element = repos[0];

    test = repos
      .filter((r) => r.reponame === element.reponame)
      .map((r) => [r.reponame, r.github_repo_id]);

    if (test.length > 1) {
      foundDuplicates = true;
      console.log(test);
      console.log("|||||||||||||||||||||||||||||||");
    }

    repos = repos.filter((r) => r.reponame !== element.reponame);
  }

  if (foundDuplicates) {
    console.log("FAIL");
  } else {
    console.log("GOOD");
  }

  res.send("ok");
  /* End test */
});

router.use("/auth", authRoutes);
router.use("/repo", repoRoutes);
router.use("/user", userRoutes);
router.use("/aggCharts", aggregateChartsRoutes);

module.exports = router;
