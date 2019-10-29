var RepositoryModel = require('../models/Repository.js');

module.exports = {
    getAll: () => {
        return RepositoryModel.find();
    },

    getRepoById: (id) => {
        return RepositoryModel.findById(id);
    },

    getAllReposByUserId: (userId) => {
        return RepositoryModel.find({user_id: userId});
    },

    getAllWithPopulate: (str) => {
        return RepositoryModel.find().populate(str);
    },

    getRepoByFullname: (fullname) => {
        return RepositoryModel.findOne({reponame: fullname});
    },

    create: (user_id, reponame, count, uniques, views) => {
        var repository = new RepositoryModel({
            user_id: user_id,
            reponame: reponame,
            count: count,
            uniques: uniques,
            views: views
        });
        return repository.save();
    },
};
