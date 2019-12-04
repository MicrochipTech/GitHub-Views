const UserModel = require("../models/User");

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
  }
};
