var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var userCtrl = require('../controllers/UserCtrl');
var repositoryCtrl = require('../controllers/RepositoryCtrl');
var axios = require('axios');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    userCtrl.getUserById(id).then((user)=> {
        done(null, user);
    });
});

passport.use(
    new GitHubStrategy({
        clientID: '03963de3c3c3f3cc309a',
        clientSecret: '49309e90a3564ff1e07469db3758cadea2394f3c',
        callbackURL: '/auth/github/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        userCtrl.getUserByGithubId(profile.id).then((currentUser) => {
            if(currentUser){
                currentUser.token = accessToken;
                currentUser.save().then((updatedUser) => {
                    done(null, updatedUser);
                });
            } else {
                userCtrl.create(profile.username, profile.id, accessToken).then((newUser) => {

                    var get_repo_traffic = function(user, reponame){
                        axios({
                            url: 'https://api.github.com/repos/' + reponame + '/traffic/views',
                            headers: {'Authorization': 'token ' + user.token}
                        })
                        .then(function (response) {
                            repositoryCtrl.create(
                                user._id,
                                reponame,
                                response.data['count'],
                                response.data['uniques'],
                                response.data['views']);
                        })
                        .catch(function (error) {
                        console.log(error);
                        })
                        .then(function () {
                        // always executed
                        });
                    }

                    axios({
                        url: 'https://api.github.com/users/' + newUser.username + '/repos',
                        headers: {'Authorization': 'token ' + newUser.token},
                        params: {type: 'all'}
                    })
                    .then(function (response) {
                        for (let repo of response.data) {
                            get_repo_traffic(newUser, repo['full_name']);
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                    .then(function () {
                        // always executed
                    });

                    done(null, newUser);
                });
            }
        });
        
    })
);