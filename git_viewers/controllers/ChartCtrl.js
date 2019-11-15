var ChartModel = require('../models/Chart.js');

module.exports = {
    create: (repoId) => {
        var repository = new RepositoryModel({
            repoId: repoId
        });
        return repository.save();
    }
};
