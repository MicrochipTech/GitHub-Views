const fetch = require("node-fetch");

async function getUserRepos(token) {
  const userRepos = [];
  let page = 1;
  const perPage = 100;
  const type = "all";
  let res;
  try {
    res = await fetch(
      `https://api.github.com/user/repos?type=${type}&per_page=${perPage}&page=${page}`,
      {
        method: "get",
        headers: { Authorization: `token ${token}` },
      }
    );
  } catch (err) {
    // TODO
  }

  if (res.status !== 200) {
    return { success: false, status: res.status };
  }

  let resJson;
  try {
    resJson = await res.json();
  } catch (err) {
    // TODO
  }

  while (resJson.length > 0) {
    userRepos.push(...resJson);
    if (resJson.length === 0) {
      break;
    }
    page += 1;
    // eslint-disable-next-line no-await-in-loop
    try {
      res = await fetch(
        `https://api.github.com/user/repos?type=${type}&per_page=${perPage}&page=${page}`,
        {
          method: "get",
          headers: { Authorization: `token ${token}` },
        }
      );
    } catch (err) {
      // TODO
    }
    if (res.status !== 200) {
      return { success: false, status: res.status };
    }
    // eslint-disable-next-line no-await-in-loop
    try {
      resJson = await res.json();
    } catch (err) {
      // TODO
    }
  }
  return { success: true, data: userRepos };
}

async function getRepoDetailsById(repoid, token) {
  let response;
  try {
    response = await fetch(`https://api.github.com/repositories/${repoid}`, {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`,
      },
    });
  } catch (err) {
    // TODO
    console.log(`getRpoDetailsById ${repoid}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response, responseJson };
}

async function getRepoViews(reponame, token) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${reponame}/traffic/views`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoViews repo ${reponame}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

async function getRepoClones(reponame, token) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${reponame}/traffic/clones`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoClones repo ${reponame}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

async function getRepoPopularPaths(reponame, token) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${reponame}/traffic/popular/paths`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoPopularPaths repo ${reponame}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

async function getRepoPopularReferrers(reponame, token) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${reponame}/traffic/popular/referrers`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoPopularReferrers repo ${reponame}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

async function getRepoForks(github_repo_id) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repositories/${github_repo_id}/forks`,
      {
        method: "get",
        redirect: "manual",
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoForks repo ${github_repo_id}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

async function updateForksTree(github_repo_id) {
  let repoForks;
  try {
    repoForks = await getRepoForks(github_repo_id);
  } catch (err) {
    // TODO
    console.log(
      `updateForksTree : Error building fork tree for ${github_repo_id}`
    );
  }

  const { response, responseJson } = repoForks;

  if (
    response.status === 403 &&
    response.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: response.headers.get("x-ratelimit-reset"),
    };
  }

  const children = [];

  for (var i = 0; i < responseJson.length; i += 1) {
    let forksTree;
    try {
      forksTree = await updateForksTree(responseJson[i].id);
    } catch (err) {
      // TODO
    }

    const { status, data } = forksTree;
    if (status === false) {
      return { status, data };
    }

    children.push({
      github_repo_id: responseJson[i].id,
      reponame: responseJson[i].full_name,
      count: responseJson[i].forks_count,
      children: data,
    });
  }

  return { success: true, data: children };
}

async function getRepoCommits(github_repo_id) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repositories/${github_repo_id}/commits`,
      {
        method: "get",
        redirect: "manual",
      }
    );
  } catch (err) {
    // TODO
    console.log(`getRepoCommits repo ${github_repo_id}: error`);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    // TODO
  }

  return { response: response, responseJson };
}

module.exports = {
  getUserRepos,
  getRepoDetailsById,
  getRepoViews,
  getRepoClones,
  getRepoPopularPaths,
  getRepoPopularReferrers,
  getRepoForks,
  updateForksTree,
  getRepoCommits,
};
