const axios = require("axios");
const fetch = require("node-fetch");

async function getUserRepos(user, token) {
  let userRepos = [];
  let page = 1;
  // eslint-disable-next-line camelcase
  const per_page = 100;
  const type = "all";
  let res = await axios({
    url: `https://api.github.com/user/repos`,
    headers: { Authorization: `token ${token}` },
    params: { type, per_page, page }
  });

  while (typeof res.data !== "undefined" && res.data.length > 0) {
    userRepos = userRepos.concat(res.data);
    page += 1;
    // eslint-disable-next-line no-await-in-loop
    res = await axios({
      url: `https://api.github.com/user/repos`,
      headers: { Authorization: `token ${token}` },
      params: { type, per_page, page }
    });
  }
  return userRepos;
}

async function getRepoDetailsById(repoid, token) {
  const response = await fetch(
    `https://api.github.com/repositories/${repoid}`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRpoDetailsById ${repoid}: error`));
  const responseJson = await response.json();

  return { response, responseJson };
}

async function getRepoViews(reponame, token) {
  const response = await fetch(
    `https://api.github.com/repos/${reponame}/traffic/views`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRepoViews repo ${reponame}: error`));

  const responseJson = await response.json();

  return { response: response, responseJson };
}

async function getRepoClones(reponame, token) {
  const response = await fetch(
    `https://api.github.com/repos/${reponame}/traffic/clones`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRepoClones repo ${reponame}: error`));

  const responseJson = await response.json();

  return { response: response, responseJson };
}

async function getRepoPopularPaths(reponame, token) {
  const response = await fetch(
    `https://api.github.com/repos/${reponame}/traffic/popular/paths`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRepoPopularPaths repo ${reponame}: error`));

  const responseJson = await response.json();

  return { response: response, responseJson };
}

async function getRepoPopularReferrers(reponame, token) {
  const response = await fetch(
    `https://api.github.com/repos/${reponame}/traffic/popular/referrers`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRepoPopularReferrers repo ${reponame}: error`));

  const responseJson = await response.json();

  return { response: response, responseJson };
}

async function getRepoForks(github_repo_id) {
  const response = await fetch(
    `https://api.github.com/repositories/${github_repo_id}/forks`,
    {
      method: "get",
      redirect: "manual"
    }
  ).catch(() => console.log(`getRepoForks repo ${reponame}: error`));

  const responseJson = await response.json();

  return { response: response, responseJson };
}

async function updateForksTree(github_repo_id) {
  const { response, responseJson } = await getRepoForks(github_repo_id).catch(
    () => {
      console.log(
        `updateForksTree : Error building fork tree for ${github_repo_id}`
      );
    }
  );

  if (
    response.status === 403 &&
    response.headers.get("x-ratelimit-remaining") === "0"
  ) {
    return {
      status: false,
      data: response.headers.get("x-ratelimit-reset")
    };
  }

  const children = [];

  for (var i = 0; i < responseJson.length; i += 1) {
    const { status, data } = await updateForksTree(responseJson[i].id);

    if (status === false) {
      return { status, data };
    }

    children.push({
      github_repo_id: responseJson[i].id,
      reponame: responseJson[i].full_name,
      count: responseJson[i].forks_count,
      children: data
    });
  }

  return { success: true, data: children };
}

module.exports = {
  getUserRepos,
  getRepoDetailsById,
  getRepoViews,
  getRepoClones,
  getRepoPopularPaths,
  getRepoPopularReferrers,
  getRepoForks,
  updateForksTree
};
