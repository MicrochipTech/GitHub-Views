const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    githubId: String,
    token: String,
    sharedRepos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
