const RepositoryModel = require("../models/Repository.js");
const userCtrl = require("../controllers/UserCtrl");

module.exports = {
  getRepoByName: reponame => {
    return RepositoryModel.findOne({ reponame: reponame });
  },

  getAllWithPopulate: str => {
    return RepositoryModel.find().populate(str);
  },

  share: (req, res) => {
    const { repoId, username } = req.body;

    userCtrl.getUserByUsername(username).then(user => {
      if (user) {
        user.sharedRepos.push(repoId);
        user.save();
        res.send("Success sharing the repo!");
      } else {
        res.send("User not found!");
      }
    });
  }
};
