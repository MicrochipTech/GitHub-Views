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
                userCtrl.create(profile.username, profile.id, accessToken).then((newUser) => {
                    const getRepoTraffic = (user, reponame) => {
                        axios({
                            url: `https://api.github.com/repos/${reponame}/traffic/views`,
                            headers: { Authorization: `token ${user.token}` },
                        })
                            .then((response) => {
                                const time = new Date();
                                time.setHours(0, 0, 0, 0);
                                time.setDate(time.getDate() - 14);

                                const { count, uniques, views } = response.data;

                                for (let index = 0; index < 14; index += 1) {
                                    if (views[index] === undefined) {
                                        views.push({
                                            timestamp: time.toISOString(),
                                            count: 0,
                                            uniques: 0,
                                        });
                                    } else if (time < new Date(views[index].timestamp)) {
                                        views.splice(index, 0, {
                                            timestamp: time.toISOString(),
                                            count: 0,
                                            uniques: 0,
                                        });
                                    }

                                    time.setDate(time.getDate() + 1);
                                }

                                repositoryCtrl.create(
                                    user._id,
                                    reponame,
                                    count,
                                    uniques,
                                    views,
                                );
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    };

                    axios({
                        url: `https://api.github.com/users/${newUser.username}/repos`,
                        headers: { Authorization: `token ${newUser.token}` },
                        params: { type: 'all' },
                    })
                        .then((response) => {
                            response.data.forEach((repo) => {
                                getRepoTraffic(newUser, repo.full_name);
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        });

                    done(null, newUser);
                });
            }
        });
    }),
);
