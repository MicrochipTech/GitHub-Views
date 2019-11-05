const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const axios = require('axios');
const userCtrl = require('../controllers/UserCtrl');
const repositoryCtrl = require('../controllers/RepositoryCtrl');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    userCtrl.getUserById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GitHubStrategy({
        clientID: '03963de3c3c3f3cc309a',
        clientSecret: '49309e90a3564ff1e07469db3758cadea2394f3c',
        callbackURL: '/auth/github/redirect',
    }, (accessToken, refreshToken, profile, done) => {
        userCtrl.getUserByGithubId(profile.id).then((currentUser) => {
            if (currentUser) {
                currentUser.token = accessToken;
                currentUser.save().then((updatedUser) => {
                    done(null, updatedUser);
                });
            } else {
                userCtrl.create(profile.username, profile.id, accessToken).then((newUser) => {
                    const getRepoTraffic = (user, reponame) => {
                        axios({
                            url: `https://api.github.com/repos/${reponame}/traffic/views`,
                            headers: { Authorization: `token ${user.token}` },
                        })
                            .then((response) => {
                                repositoryCtrl.create(
                                    user._id,
                                    reponame,
                                    response.data.count,
                                    response.data.uniques,
                                    response.data.views,
                                );
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                            .then(() => {
                            // always executed
                            });
                    };

                    axios({
                        url: `https://api.github.com/users/${newUser.username}/repos`,
                        headers: { Authorization: `token ${newUser.token}` },
                        params: { type: 'all' },
                    })
                        .then((response) => {
                            for (let repo of response.data) {
                                getRepoTraffic(newUser, repo['full_name']);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                        .then(() => {
                            // always executed
                        });

                    done(null, newUser);
                });
            }
        });
    }),
);
