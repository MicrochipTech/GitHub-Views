const axios = require("axios");
const fetch = require("node-fetch");
const RepositoryModel = require("../models/Repository.js");
const { response } = require("express");

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

async function getRepoForks(reponame) {

  const response = await fetch(
    `https://api.github.com/repos/${reponame}/forks`,
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

  if(response.headers.get('x-ratelimit-remaining') === 0) {
    return {
      status: false,
      data: response.headers.get('x-ratelimit-reset')
    }
  }

  const children = [];

  for(var i = 0; i < responseJson.length; i += 1) {
    
    const { status, data } = await updateForksTree(responseJson[i].id);

    if(status === false) {
      return { status, data }
    }
    
    children.push(
      {
        github_repo_id: responseJson[i].id,
        reponame: responseJson[i].full_name,
        count: responseJson[i].forks_count,
        children: data
      }
    );
  }

  return { success: true, data: children };
}

async function getRepoTraffic(reponame, token) {
  const {
    response: viewsResponse,
    responseJson: viewsResponseJson
  } = await getRepoViews(reponame, token).catch(
    () => {
      console.log(
        `getRepoTraffic : Error getting repo views for repo ${reponame}`
      );
    }
  );

  const {
    response: cloneResponse,
    responseJson: cloneResponseJson
  } = await getRepoClones(reponame, token).catch(
    () => {
      console.log(
        `getRepoTraffic : Error getting repo clones for repo ${reponame}`
      );
    }
  );

  return {...viewsResponseJson, clones: cloneResponseJson.clones}
}

/* TODO rename function */
async function createNewUpdatedRepo(repoDetails, userId, token) {
  traffic = await getRepoTraffic(
    repoDetails.full_name,
    token
  );

  const { views, clones } = traffic;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (
    views.length !== 0 &&
    new Date(views[views.length - 1].timestamp).getTime() >= today.getTime()
  ) {
    views.pop();
  }

  if (
    clones.length !== 0 &&
    new Date(clones[clones.length - 1].timestamp).getTime() >= today.getTime()
  ) {
    clones.pop();
  }

  return new RepositoryModel({
    user_id: userId,
    github_repo_id: repoDetails.id,
    reponame: repoDetails.full_name,
    views,
    clones: {
      total_count: clones.reduce((accumulator, currentClone) => accumulator + currentClone.count, 0),
      total_uniques: clones.reduce((accumulator, currentClone) => accumulator + currentClone.uniques, 0),
      data: clones
    },
    forks: {
      tree_updated: false,
      data: [
        {
          timestamp: today.toISOString(),
          count: repoDetails.forks_count
        }
      ],
      children: []
    },
    not_found: false
  });
}

module.exports = {
  getRepoDetailsById,
  getUserRepos,
  getRepoTraffic,
  updateForksTree,
  createNewUpdatedRepo
};
