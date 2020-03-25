const axios = require("axios");

module.exports = {
  getUserRepos: async (user, token) => {
    let userRepos = [];
    let page = 1;
    // eslint-disable-next-line camelcase
    const per_page = 100;
    const type = "all";
    let res = await axios({
      url: `https://api.github.com/users/${user.username}/repos`,
      headers: { Authorization: `token ${token}` },
      params: { type, per_page, page }
    });

    while (typeof res.data !== "undefined" && res.data.length > 0) {
      userRepos = userRepos.concat(res.data);
      page += 1;
      // eslint-disable-next-line no-await-in-loop
      res = await axios({
        url: `https://api.github.com/users/${user.username}/repos`,
        headers: { Authorization: `token ${token}` },
        params: { type, per_page, page }
      });
    }
    return userRepos;
  },

  getRepoTraffic: (repo, token) => {
    return axios({
      url: `https://api.github.com/repos/${repo}/traffic/views`,
      headers: { Authorization: `token ${token}` }
    });
  }
};
