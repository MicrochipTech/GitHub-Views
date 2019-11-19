const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reponame: String,
    count: Number,
    uniques: Number,
    views: [{
        timestamp: Date,
        count: Number,
        uniques: Number,
    }],
});

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;
