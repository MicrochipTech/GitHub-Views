const UserModel = require("../models/User");

module.exports = {
  getAllUsers: () => {
    return UserModel.find();
  },

  getWhereUsernameStartsWith: async (req, res) => {
    const { q } = req.query;
    const users = await UserModel.find(
      {
        username: {
          $regex: `${q}.*`
        }
      },
      { username: 1, _id: 0 }
    );
    res.send(users.map(u => u.username));
  },

  getUserByUsername: username => {
    return UserModel.findOne({ username: username });
  }
};
