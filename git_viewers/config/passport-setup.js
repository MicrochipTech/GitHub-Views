const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const axios = require('axios');
const userCtrl = require('../controllers/UserCtrl');
const repositoryCtrl = require('../controllers/RepositoryCtrl');

const UserModel = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    done(null, user);
});

passport.use(
    new GitHubStrategy({
        clientID: '03963de3c3c3f3cc309a',
        clientSecret: '49309e90a3564ff1e07469db3758cadea2394f3c',
        callbackURL: '/auth/github/redirect',
    }, (accessToken, refreshToken, profile, done) => {
        userCtrl.getUserByGithubId(profile.id).then((currentUser) => {
            if (currentUser) {
                const existingUser = currentUser;
                existingUser.token = accessToken;
                existingUser.save().then((updatedUser) => {
                    done(null, updatedUser);
                });
            } else {
                userCtrl.create(profile.username, profile.id, accessToken).then(async (newUser) => {
                    const getRepoTraffic = async (user, reponame) => {
                        let response = await axios({
                            url: `https://api.github.com/repos/${reponame}/traffic/views`,
                            headers: { Authorization: `token ${user.token}` },
                        });
                        var { count, uniques, views } = response.data;
                        
                        var today = new Date();
                        today.setUTCHours(0, 0, 0, 0);

                        views = views.filter(
                            (info) => {
                                infoTimestamp = new Date(info.timestamp);

                                if (infoTimestamp.getTime() < today.getTime()) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        );

                        repositoryCtrl.create(
                            user._id,
                            reponame,
                            count,
                            uniques,
                            views,
                        );
                    };

                    let response = await axios({
                        url: `https://api.github.com/users/${newUser.username}/repos`,
                        headers: { Authorization: `token ${newUser.token}` },
                        params: { type: 'all' },
                    });

                    response.data.forEach((repo) => {
                        getRepoTraffic(newUser, repo.full_name);
                    });

                    done(null, newUser);
                });
            }
        });
    }),
);
