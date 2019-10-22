var UserModel = require('../models/User');

module.exports = {
    getAll: () => {
        return UserModel.find();
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

    create: (username, githubId, token) => {
        var user = new UserModel({
            username: username,
            githubId: githubId,
            token: token
        });
        return user.save();
    },
}
