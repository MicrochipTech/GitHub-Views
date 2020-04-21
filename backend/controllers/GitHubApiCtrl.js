const axios = require("axios");
const fetch = require("node-fetch");
const RepositoryModel = require("../models/Repository.js");

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

async function getRepoTraffic(reponame, token) {
  const response = await fetch(
    `https://api.github.com/repos/${reponame}/traffic/views`,
    {
      method: "get",
      redirect: "manual",
      headers: {
        Authorization: `token ${token}`
      }
    }
  ).catch(() => console.log(`getRepoTraffic ${reponame}: error`));

  const responseJson = await response.json();

  return { response, responseJson };
}

async function createNewUpdatedRepo(repoDetails, userId, token) {
  const { responseJson: repoTrafficResponse } = await getRepoTraffic(
    repoDetails.full_name,
    token
  );

  const { views } = repoTrafficResponse;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (
    views.length !== 0 &&
    new Date(views[views.length - 1].timestamp).getTime() >= today.getTime()
  ) {
    views.pop();
  }

  return new RepositoryModel({
    user_id: userId,
    github_repo_id: repoDetails.id,
    reponame: repoDetails.full_name,
    views,
    not_found: false
  }).save();
}

module.exports = {
  getRepoDetailsById,
  getUserRepos,
  getRepoTraffic,
  createNewUpdatedRepo
};
