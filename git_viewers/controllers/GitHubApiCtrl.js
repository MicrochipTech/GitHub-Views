const axios = require("axios");

module.export = {
  getUserRepos: user => {
    return axios({
      url: `https://api.github.com/users/${user.username}/repos`,
      headers: { Authorization: `token ${user.token}` },
      params: { type: "all" }
    });
  },

  getRepoTraffic: (repo, token) => {
    return axios({
      url: `https://api.github.com/repos/${repo}/traffic/views`,
      headers: { Authorization: `token ${token}` }
    });
  }
};
