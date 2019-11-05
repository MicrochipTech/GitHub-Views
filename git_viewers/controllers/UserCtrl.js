const UserModel = require('../models/User');

module.exports = {
    getWhereUsernameStartsWith: async (req, res) => {
        const { q } = req.query;
        const users = await UserModel.find({
            username: {
                $regex: `${q}.*`,
            },
        }, { username: 1, _id: 0 });
        res.send(users.map((u) => u.username));
    },

    getUserByGithubId: (githubId) => {
        return UserModel.findOne({githubId: githubId});
    },

    getUserByUsername: (username) => {
        return UserModel.findOne({username: username})
    },

    create: (username, githubId, token) => {
        const user = new UserModel({
            username: username,
            githubId: githubId,
            token: token,
        });
        return user.save();
    },
};
