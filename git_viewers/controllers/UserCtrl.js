var UserModel = require('../models/User');

module.exports = {
    getAll: () => {
        return UserModel.find();
    },

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

    getUserById: (id) => {
        return UserModel.findById(id);
    },

    getUserByUsername: (username) => {
        return UserModel.findOne({username: username})
    },

    updateTokenWhereGithubIdIs: (token, githubId) => {
        return UserModel.findOneAndUpdate({githubId: githubId}, {$set: {token: token}});
    },

    getUserByIdWithPopulate: (id, str) => {
        return UserModel.findById(id).populate(str);
    },

    create: (username, githubId, token) => {
        var user = new UserModel({
            username: username,
            githubId: githubId,
            token: token
        });
        return user.save();
    },
}
