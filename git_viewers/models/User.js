var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    githubId: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;