var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    githubId: String,
    token: String,
    sharedRepos: [{
        repoId: String
    }]
});

var User = mongoose.model('User', userSchema);

module.exports = User;