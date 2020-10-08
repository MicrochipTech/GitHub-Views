const fetch = require("node-fetch");
const { logger, errorHandler } = require("../logs/logger");

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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET from GitHub API.`,
      err
    );
  }

  if (res.status !== 200) {
    return { success: false, status: res.status };
  }

  let resJson;
  try {
    resJson = await res.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API.`,
      err
    );
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
      errorHandler(
        `${arguments.callee.name}: Error caught in GET from GitHub API.`,
        err
      );
    }
    if (res.status !== 200) {
      return { success: false, status: res.status };
    }
    // eslint-disable-next-line no-await-in-loop
    try {
      resJson = await res.json();
    } catch (err) {
      errorHandler(
        `${arguments.callee.name}: Error caught when processing the reponse from GitHub API.`,
        err
      );
    }
  }
  return { success: true, data: userRepos };
}

async function getUserProfile(token) {
  let response;
  try {
    response = await fetch(`https://api.github.com/user`, {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`,
      },
    });
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught in GET user profile from GitHub API.`,
      err
    );
  }

  if (response.status !== 200) {
    return { success: false, data: response.status };
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API.`,
      err
    );
  }

  return { success: true, data: responseJson };
}

async function getUserEmails(token) {
  let response;
  try {
    response = await fetch(`https://api.github.com/user/emails`, {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`,
      },
    });
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught in GET user emails from GitHub API.`,
      err
    );
  }

  if (response.status !== 200) {
    return { success: false, data: response.status };
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API.`,
      err
    );
  }

  return { success: true, data: responseJson };
}

async function getRepoDetailsById(github_repo_id, token) {
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repositories/${github_repo_id}`,
      {
        method: "get",
        redirect: "manual",
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo details from GitHub API for repo with GitHub repo id ${github_repo_id}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo with GitHub repo id ${github_repo_id}.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo views from GitHub API for repo ${reponame}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo ${reponame}.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo clones from GitHub API for repo ${reponame}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo ${reponame}.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo popular paths from GitHub API for repo ${reponame}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo ${reponame}.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo popular referrers from GitHub API for repo ${reponame}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo ${reponame}.`,
      err
    );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo forks from GitHub API for repo with GitHub repo id${github_repo_id}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo with GitHub repo id${github_repo_id}.`,
      err
    );
  }

  return { response: response, responseJson };
}

async function updateForksTree(github_repo_id) {
  let repoForks;
  try {
    repoForks = await getRepoForks(github_repo_id);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when trying to update the forks tree for repo with GitHub repo id ${github_repo_id}.`,
      err
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
      errorHandler(
        `${arguments.callee.name}: Error caught in the recursive call for the repo with GitHub repo id ${github_repo_id}.`,
        err
      );
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
    errorHandler(
      `${arguments.callee.name}: Error caught in GET repo commits from GitHub API for repo with GitHub repo id ${github_repo_id}.`,
      err
    );
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when processing the reponse from GitHub API for repo with GitHub repo id ${github_repo_id}.`,
      err
    );
  }

  return { response: response, responseJson };
}

module.exports = {
  getUserRepos,
  getUserProfile,
  getUserEmails,
  getRepoDetailsById,
  getRepoViews,
  getRepoClones,
  getRepoPopularPaths,
  getRepoPopularReferrers,
  getRepoForks,
  updateForksTree,
  getRepoCommits,
};
