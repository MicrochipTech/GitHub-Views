const UserModel = require("../models/User");
const RepositoryModel = require("../models/Repository");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");

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
  } catch(err) {
    // TODO
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

async function createRepository(repoDetails, userId, token) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const newRepo = new RepositoryModel({
    users: [userId],
    github_repo_id: repoDetails.id,
    reponame: repoDetails.full_name,
    views: [],
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
    repoTraffic = await getRepoTraffic(
      newRepo.reponame,
      token
    );
  } catch(err) {
    // TODO
  }
  const { status, data: traffic } = repoTraffic;
  
  if (status === false) {
    console.log(`Fail getting traffic data for repo ${newRepo.reponame}`);
    return { success: false };
  }

  updateRepoTraffic(newRepo, traffic);

  return { success: true, data: newRepo };
}

function updateRepoTraffic(repo, traffic) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  /* Update views */
  let viewsToUpdate = traffic.views;
  if (repo.views.length !== 0) {
    const lastViewTimestamp = repo.views[repo.views.length - 1].timestamp;
    viewsToUpdate = viewsToUpdate.filter((info) => {
      const timestampDate = new Date(info.timestamp);
      timestampDate.setUTCHours(0, 0, 0, 0);

      if (
        timestampDate.getTime() > lastViewTimestamp.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  } else if (
    viewsToUpdate.length !== 0 &&
    new Date(viewsToUpdate[viewsToUpdate.length - 1].timestamp).getTime() ===
      today.getTime()
  ) {
    /* If the views data is empty, check only the last timestamp. If it includes data from today, remove it */
    viewsToUpdate.pop();
  }

  repo.views.push(...viewsToUpdate);

  /* Update clones */
  let clonesToUpdate = traffic.clones;
  if (repo.clones.data.length !== 0) {
    const lastCloneTimestamp =
      repo.clones.data[repo.clones.data.length - 1].timestamp;
    clonesToUpdate = clonesToUpdate.filter((info) => {
      const timestampDate = new Date(info.timestamp);

      if (
        timestampDate.getTime() > lastCloneTimestamp.getTime() &&
        timestampDate.getTime() < today.getTime()
      ) {
        return true;
      }

      return false;
    });
  } else if (
    clonesToUpdate.length !== 0 &&
    new Date(clonesToUpdate[clonesToUpdate.length - 1].timestamp).getTime() ===
      today.getTime()
  ) {
    /* If the clones data is empty, check only the last timestamp. If it includes data from today, remove it */
    clonesToUpdate.pop();
  }

  repo.clones.total_count += clonesToUpdate.reduce(
    (accumulator, currentClone) => accumulator + currentClone.count,
    0
  );
  repo.clones.total_uniques += clonesToUpdate.reduce(
    (accumulator, currentClone) => accumulator + currentClone.uniques,
    0
  );
  repo.clones.data.push(...clonesToUpdate);

  /* Update referrers */
  traffic.referrers.forEach((data) => {
    foundReferrer = repo.referrers.find((r) => r.name === data.referrer);
    if (foundReferrer) {
      /* The referrer is already in database */
      foundReferrer.data.push({
        timestamp: today.toISOString(),
        count: data.count,
        uniques: data.uniques,
      });
    } else {
      /* Add the new referrer in database */
      repo.referrers.push({
        name: data.referrer,
        data: [
          {
            timestamp: today.toISOString(),
            count: data.count,
            uniques: data.uniques,
          },
        ],
      });
    }
  });

  /* Update content */
  traffic.contents.forEach((data) => {
    foundContent = repo.contents.find((c) => c.path === data.path);
    if (foundContent) {
      /* The content is already in database */
      foundContent.data.push({
        timestamp: today.toISOString(),
        count: data.count,
        uniques: data.uniques,
      });
    } else {
      /* Add the new content in database */
      repo.contents.push({
        path: data.path,
        title: data.title,
        data: [
          {
            timestamp: today.toISOString(),
            count: data.count,
            uniques: data.uniques,
          },
        ],
      });
    }
  });
}

async function getRepoTraffic(reponame, token) {
  let repoViews;
  try {
    repoViews = await GitHubApiCtrl.getRepoViews(reponame, token);
  } catch(err) {
    // TODO
    console.log(
      `getRepoTraffic : Error getting repo views for repo ${reponame}`
    );
  };

  const {
    response: viewsResponse,
    responseJson: viewsResponseJson,
  } = repoViews;

  if (
    viewsResponse.status === 403 &&
    viewsResponse.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: viewsResponse.headers.get("x-ratelimit-reset"),
    };
  }

  let repoClones;
  try {
    repoClones = await GitHubApiCtrl.getRepoClones(reponame, token);
  } catch(err) {
    // TODO
    console.log(
      `getRepoTraffic : Error getting repo clones for repo ${reponame}`
    );
  }
  const {
    response: cloneResponse,
    responseJson: cloneResponseJson,
  } = repoClones;

  if (
    cloneResponse.status === 403 &&
    cloneResponse.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: cloneResponse.headers.get("x-ratelimit-reset"),
    };
  }

  try {
    repoPopularReferrers = await GitHubApiCtrl.getRepoPopularReferrers(reponame, token);
  } catch(err) {
    // TODO
    console.log(
      `getRepoPopularReferrers : Error getting repo referrers for repo ${reponame}`
    );
  }

  const {
    response: referrerResponse,
    responseJson: referrerResponseJson,
  } = repoPopularReferrers;

  if (
    referrerResponse.status === 403 &&
    referrerResponse.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: referrerResponse.headers.get("x-ratelimit-reset"),
    };
  }

  let repoPopularPaths;
  try {
    repoPopularPaths = await GitHubApiCtrl.getRepoPopularPaths(reponame, token);
  } catch(err) {
    // TODO
    console.log(
      `getRepoPopularPaths : Error getting repo referrers for repo ${reponame}`
    );
  }

  const {
    response: pathResponse,
    responseJson: pathResponseJson,
  } = repoPopularPaths;

  if (
    pathResponse.status === 403 &&
    pathResponse.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: pathResponse.headers.get("x-ratelimit-reset"),
    };
  }

  return {
    status: true,
    data: {
      ...viewsResponseJson,
      clones: cloneResponseJson.clones || [],
      referrers: referrerResponseJson || [],
      contents: pathResponseJson || [],
    },
  };
}

async function updateForksTree(req, res) {
  const { repo_id } = req.body;
  let repoEntry;
  try {
    repoEntry = await RepositoryModel.findOne({ _id: repo_id });
  } catch(err) {
    // TODO
  }

  let forksTree;
  try {
    forksTree = await GitHubApiCtrl.updateForksTree(repoEntry.github_repo_id);
  } catch(err) {
    // TODO
    console.log(`Error updateForksTree on repo: ${repoEntry.reponame}`);
  }

  const {
    status: treeStatus,
    data: treeData,
  } = forksTree;

  if (treeStatus === false) {
    console.log(`Tree not updated for repo: ${repoEntry.reponame}`);
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
  } catch(err) {
    // TODO
  }

  if (repoEntry.commits.updated) {
    // TO REVIEW
    return {
      status: true,
      data: repoEntry.commits.data,
    };
  }

  try {
    repoCommits = await GitHubApiCtrl.getRepoCommits(github_repo_id);
  } catch(err) {
    // TODO
    console.log(
      `updateRepoCommits : Error getting commits for repository ${github_repo_id}`
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
  } catch(err) {
    // TODO
  }

  if (username === req.user.username) {
    let repo;
    try{
      repo = await RepositoryModel.findOne({ _id: repoId });
    } catch(err) {
      // TODO
    }
    res.json({ repo });
  } else {
    res.send("Success sharing the repo!");
  }
}

module.exports = {
  createRepository,
  updateRepoTraffic,
  getRepoTraffic,
  updateForksTree,
  updateRepoCommits,
  share,
  nameContains,
};
