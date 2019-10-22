var mongoose = require('mongoose');

var repositorySchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    reponame: String,
    count: Number,
    uniques: Number,
    views: [{
        timestamp: Date,
        count: Number,
        uniques: Number
    }]
});

var Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;