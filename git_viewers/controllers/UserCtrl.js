const UserModel = require("../models/User");

module.exports = {
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
    const usersList = users.map(u => u.username);
    usersList.splice(usersList.indexOf(req.user.username), 1);
    res.send(usersList);
  }
};
