const UserModel = require("../models/User");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryModel = require("../models/Repository");
const TokenModel = require("../models/Token");

const UserCtrl = require("./UserCtrl");

module.exports = {
  share: async (req, res) => {
    const { repoId, username } = req.body;

    if (username === req.user.username) {
      res.send("Error sharing the repo!");
    } else {
      const user = await UserModel.findOne({ username });
      user.sharedRepos.push(repoId);
      await user.save();
      res.send("Success sharing the repo!");
    }
  },

  sync: async (req, res) => {
    const { user } = req;
    const t = await TokenModel.findOne({ _id: user.token_ref });
    
    const success = await UserCtrl.syncRepos(user, t.value, false);

    if (success) {
      UserCtrl.getData(req, {
        json: data => {
          res.json({ status: "ok", data });
        }
      });
    } else {
      res.json({ status: "ok" });
    }
  }
};
