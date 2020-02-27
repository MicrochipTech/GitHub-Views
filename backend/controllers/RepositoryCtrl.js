const UserModel = require("../models/User");
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryModel = require("../models/Repository");

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
    const response = await GitHubApiCtrl.getUserRepos(user);
    let anyNewRepo = false;

    const p = response.data.map(async repo => {
      const repoEntry = await RepositoryModel.findOne({
        reponame: repo.full_name,
        user_id: user._id
      });

      if (repoEntry === null) {
        anyNewRepo = true;
        const repoTrafficResponse = await GitHubApiCtrl.getRepoTraffic(
          repo.full_name,
          user.token
        );
        const { views } = repoTrafficResponse.data;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (
          views.length !== 0 &&
          new Date(views[views.length - 1].timestamp).getTime() >=
            today.getTime()
        ) {
          views.pop();
        }

        await new RepositoryModel({
          user_id: user._id,
          reponame: repo.full_name,
          views
        }).save();
      }
    });

    await Promise.all(p);

    if (anyNewRepo) {
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
