var RepositoryModel = require('../models/Repository.js');

module.exports = {
    getAll: () => {
        return RepositoryModel.find();
    },

    getRepoById: (id) => {
        return RepositoryModel.findById(id);
    },

    getAllWithPopulate: (str) => {
        return RepositoryModel.find().populate(str);
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
