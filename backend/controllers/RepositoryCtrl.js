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

  updateForksTree: async (req, res) => {
    const { repo_id } = req.body;
    console.log(repo_id)
    const repoEntry = await RepositoryModel.findOne({_id: repo_id});

    const {status: treeStatus, data: treeData} = await GitHubApiCtrl.updateForksTree(repoEntry.github_repo_id).catch(
      () => {
        console.log(`Error updateForksTree on repo: ${repoEntry.reponame}`);
      }
    );

    if(treeStatus === false){
      console.log(`Tree not updated for repo: ${repoEntry.reponame}`);
    }

    res.json({
      treeData,
      treeStatus
    })
  },

  sync: async (req, res) => {
    const { user } = req;
    const t = await TokenModel.findOne({ _id: user.token_ref });

    const success = await UserCtrl.syncRepos(user, t.value);

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
