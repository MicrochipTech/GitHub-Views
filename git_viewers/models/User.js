var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    githubId: String,
    token: String,
    sharedRepos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Repository'}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;