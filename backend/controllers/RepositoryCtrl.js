const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const { logger, errorHandler } = require("../logs/logger");
const getRepoDataBetween = require("../mongoQueries/getUserReposWithTrafficBetween");

async function nameContains(req, res) {
  const { q } = req.query;
  let repos;
  try {
    repos = await RepositoryModel.find(
      {
        reponame: {
          $regex: `${q}.*`,
        },
      },
      { reponame: 1, createAt: 1, _id: 1 }
    );
  } catch (err) {
    res.send({ success: false, error: `Error getting data from database.` });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting from database repos with the name containing ${q} sequence.`,
      err,
      false
    );
  }

  const reposList = repos
    .filter((r) => {
      if (req.user.sharedRepos.indexOf(r._id) !== -1) return 0;
      const publicRepoOwners = process.env.PUBLIC_REPO_OWNERS.split(" ");
      for (let i = 0; i < publicRepoOwners.length; i++) {
        if (r.reponame.startsWith(publicRepoOwners[i])) return true;
      }
      return false;
    })
    .map((r) => ({ reponame: r.reponame, _id: r._id }));

  res.send(reposList);
}

async function getRepoTraffic(reponame, token) {
  let repoViews;
  try {
    repoViews = await GitHubApiCtrl.getRepoViews(reponame, token);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting views traffic data for the repo ${reponame}.`,
      err
    );
  }

  const {
    response: viewsResponse,
    responseJson: viewsResponseJson,
  } = repoViews;

  if (viewsResponse.status !== 200) {
    return {
      status: false,
      data: viewsResponse.headers.get("x-ratelimit-reset"),
    };
  }

  let repoClones;
  try {
    repoClones = await GitHubApiCtrl.getRepoClones(reponame, token);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting clones traffic data for the repo ${reponame}.`,
      err
    );
  }
  const {
    response: cloneResponse,
    responseJson: cloneResponseJson,
  } = repoClones;

  if (cloneResponse.status !== 200) {
    return {
      status: false,
      data: cloneResponse.headers.get("x-ratelimit-reset"),
    };
  }

  try {
    repoPopularReferrers = await GitHubApiCtrl.getRepoPopularReferrers(
      reponame,
      token
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting referrers traffic data for the repo ${reponame}.`,
      err
    );
  }

  const {
    response: referrerResponse,
    responseJson: referrerResponseJson,
  } = repoPopularReferrers;

  if (referrerResponse.status !== 200) {
    return {
      status: false,
      data: referrerResponse.headers.get("x-ratelimit-reset"),
    };
  }

  let repoPopularPaths;
  try {
    repoPopularPaths = await GitHubApiCtrl.getRepoPopularPaths(reponame, token);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting popular paths traffic data for the repo ${reponame}.`,
      err
    );
  }

  const {
    response: pathResponse,
    responseJson: pathResponseJson,
  } = repoPopularPaths;

  if (pathResponse.status !== 200) {
    return {
      status: false,
      data: pathResponse.headers.get("x-ratelimit-reset"),
    };
  }

  return {
    status: true,
    data: {
      views: viewsResponseJson.views || [],
      clones: cloneResponseJson.clones || [],
      referrers: referrerResponseJson || [],
      contents: pathResponseJson || [],
    },
  };
}

async function createRepository(repoDetails, userId, token) {
  /* TODO comments */
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const newRepo = new RepositoryModel({
    users: [userId],
    github_repo_id: repoDetails.id,
    reponame: repoDetails.full_name,
    views: {
      total_count: 0,
      total_uniques: 0,
      data: [],
    },
    clones: {
      total_count: 0,
      total_uniques: 0,
      data: [],
    },
    forks: {
      tree_updated: false,
      data: [
        {
          timestamp: today.toISOString(),
          count: repoDetails.forks_count,
        },
      ],
      children: [],
    },
    referrers: [],
    contents: [],
    commits: {
      updated: false,
      data: [],
    },
    not_found: false,
  });

  let repoTraffic;
  try {
    repoTraffic = await getRepoTraffic(newRepo.reponame, token);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when getting traffic data for the new repo ${newRepo.reponame}.`,
      err
    );
  }
  const { status, data: traffic } = repoTraffic;

  if (status === false) {
    logger.warn(
      `${arguments.callee.name}: Fail getting traffic data for repo ${newRepo.reponame}`
    );
    return { success: false };
  }

  updateRepoTraffic(
    {
      reponame: newRepo.reponame,
      referrers: [],
      contents: [],
      views_length: 0,
      last_view: {},
      clones_length: 0,
      last_clone: {},
      forks_sum: newRepo.forks.data[0].count,
    },
    traffic
  );

  return { success: true, data: newRepo };
}

function getNewAndNewUniques(from, existing, lastExisting) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let toUpdate = from;
  if (existing !== 0) {
    const lastTimestamp = lastExisting.timestamp;
    toUpdate = toUpdate.filter((info) => {
      const timestampDate = new Date(info.timestamp);
      timestampDate.setUTCHours(0, 0, 0, 0);

      if (
        timestampDate.getTime() > lastTimestamp.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  } else if (
    toUpdate.length !== 0 &&
    new Date(toUpdate[toUpdate.length - 1].timestamp).getTime() ===
      today.getTime()
  ) {
    /* If the views data is empty, check only the last timestamp. If it includes data from today, remove it */
    toUpdate.pop();
  }

  const new_data = toUpdate.reduce(
    (accumulator, current) => accumulator + current.count,
    0
  );
  const new_unique = toUpdate.reduce(
    (accumulator, current) => accumulator + current.uniques,
    0
  );
  return [new_data, new_unique, toUpdate];
}

function updateRepoTraffic(repo, traffic) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [new_views, new_unique_views, viewsToUpdate] = getNewAndNewUniques(
    traffic.views,
    repo.views_length,
    repo.last_view
  );
  const [new_clones, new_unique_cloners, clonesToUpdate] = getNewAndNewUniques(
    traffic.clones,
    repo.clones_length,
    repo.last_clone
  );

  RepositoryModel.updateOne(
    { _id: repo._id },
    {
      $inc: {
        "views.total_count": new_views,
        "views.total_uniques": new_unique_views,
        "clones.total_count": new_clones,
        "clones.total_uniques": new_unique_cloners,
      },
      $push: {
        "views.data": { $each: viewsToUpdate },
        "clones.data": { $each: clonesToUpdate },
      },
    }
  ).exec();

  /* Update referrers */
  traffic.referrers.forEach((data) => {
    const foundReferrer = repo.referrers.findIndex(
      (r) => r.name === data.referrer
    );
    if (foundReferrer !== -1) {
      /* The referrer is already in database */
      RepositoryModel.collection.updateOne(
        { _id: repo._id },
        {
          $push: {
            [`referrers.${foundReferrer}.data`]: {
              timestamp: today.toISOString(),
              count: data.count,
              uniques: data.uniques,
            },
          },
        }
      ); // This is run by the JS Mongo driver, .exec does not exist there, it just works
    } else {
      RepositoryModel.updateOne(
        { _id: repo._id },
        {
          $push: {
            referrers: {
              name: data.referrer,
              data: [
                {
                  timestamp: today.toISOString(),
                  count: data.count,
                  uniques: data.uniques,
                },
              ],
            },
          },
        }
      ).exec();
    }
  });

  /* Update content */
  traffic.contents.forEach((data) => {
    const foundContent = repo.contents.findIndex((c) => c.path === data.path);
    if (foundContent !== -1) {
      /* The content is already in database */
      RepositoryModel.collection.updateOne(
        { _id: repo._id },
        {
          $push: {
            [`contents.${foundContent}.data`]: {
              timestamp: today.toISOString(),
              count: data.count,
              uniques: data.uniques,
            },
          },
        }
      ); // This is run by the JS Mongo driver, .exec does not exist there, it just works
    } else {
      /* Add the new content in database */
      RepositoryModel.updateOne(
        { _id: repo._id },
        {
          $push: {
            contents: {
              path: data.path,
              title: data.title,
              data: [
                {
                  timestamp: today.toISOString(),
                  count: data.count,
                  uniques: data.uniques,
                },
              ],
            },
          },
        }
      ).exec();
    }
  });
}

async function updateForksTree(req, res) {
  const { repo_id } = req.body;
  let repoEntry;
  try {
    repoEntry = await RepositoryModel.findOne({ _id: repo_id });
  } catch (err) {
    res.send({ success: false, error: `Error getting data from database.` });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting repo from database with id ${repo_id}.`,
      err,
      false
    );
  }

  let forksTree;
  try {
    forksTree = await GitHubApiCtrl.updateForksTree(repoEntry.github_repo_id);
  } catch (err) {
    res.send({
      success: false,
      error: `Error caught when updating forks tree.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught when updating forks tree for repo ${repoEntry.reponame}.`,
      err,
      false
    );
  }

  const { status: treeStatus, data: treeData } = forksTree;

  if (treeStatus === false) {
    logger.warn(
      `${arguments.callee.name}: Tree not updated for repo: ${repoEntry.reponame}`
    );
  } else {
    repoEntry.forks.tree_updated = true;
    repoEntry.forks.children = treeData;
    repoEntry.save();
  }

  res.json({
    treeData,
    treeStatus,
  });
}

async function updateRepoCommits(req, res) {
  const { repo_id } = req.body;
  let repoEntry;
  try {
    repoEntry = await RepositoryModel.findOne({ _id: repo_id });
  } catch (err) {
    res.send({ success: false, error: `Error getting repo from database.` });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting from database repo with id ${repo_id}.`,
      err,
      false
    );
  }

  if (repoEntry.commits.updated) {
    return {
      status: true,
      data: repoEntry.commits.data,
    };
  }

  try {
    repoCommits = await GitHubApiCtrl.getRepoCommits(repoEntry.github_repo_id);
  } catch (err) {
    res.send({ success: false, error: `Error getting commits data.` });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting commits for repository with GitHub repo id ${repoEntry.github_repo_id}.`,
      err,
      false
    );
  }

  const { response, responseJson } = repoCommits;

  if (
    response.status === 403 &&
    response.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: response.headers.get("x-ratelimit-reset"),
    };
  }

  commitsData = responseJson.map((c) => {
    return {
      sha: c.sha,
      message: c.commit.message,
      timestamp: c.commit.author.date,
    };
  });

  repoEntry.commits = {
    updated: true,
    data: commitsData,
  };

  repoEntry.save();

  return {
    status: true,
    data: commitsData,
  };
}

async function share(req, res) {
  const { repoId, username } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    user.sharedRepos.push(repoId);
    await user.save();
  } catch (err) {
    res.send({
      success: false,
      error: `Error updating the sharedRepos list.`,
    });
    errorHandler(
      `${arguments.callee.name}: Error caught when getting updating the sharedRepos list for the user ${username}.`,
      err,
      false
    );
  }

  if (username === req.user.username) {
    let repo;
    try {
      repo = await RepositoryModel.findOne({ _id: repoId });
    } catch (err) {
      res.send({
        success: false,
        error: `Error getting repo from database.`,
      });
      errorHandler(
        `${arguments.callee.name}: Error caught when getting from database the repo with id ${repoId}.`,
        err,
        false
      );
    }
    res.json({ repo });
  } else {
    res.send("Success sharing the repo!");
  }
}

async function getPublicRepos(req, res) {
  const fields = {};
  if (req.query.fields !== undefined) {
    req.query.fields.split(",").forEach((f) => {
      fields[f] = 1;
    });
  }

  const repoOwners = process.env.PUBLIC_REPO_OWNERS.split(" ").join("|");
  const reponameRegex = new RegExp(`^(${repoOwners})`);

  let repos = [];
  if (req.from !== undefined && req.to !== undefined) {
    repos = await RepositoryModel.aggregate(
      getRepoDataBetween(
        { reponame: reponameRegex },
        new Date(req.from),
        new Date(req.to),
        fields
      )
    );
  } else {
    repos = await RepositoryModel.find({ reponame: reponameRegex }, fields, {
      skip: Number(req.query.page_no) * Number(req.query.page_size),
      limit: Number(req.query.page_size),
    });
  }

  res.send(repos);
}

module.exports = {
  createRepository,
  updateRepoTraffic,
  getRepoTraffic,
  updateForksTree,
  updateRepoCommits,
  share,
  nameContains,
  getPublicRepos,
};
