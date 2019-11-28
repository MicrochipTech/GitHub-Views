const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const axios = require('axios');
const RepositoryModel = require('../models/Repository.js');

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
    }, async (accessToken, refreshToken, profile, done) => {
        const currentUser = await UserModel.findOne({githubId: profile.id});

        if (currentUser) {
            const updatedUser = await UserModel.findOneAndUpdate({
                githubId: profile.id
            }, {
                token: accessToken,
            })
            done(null, updatedUser);
        } else {
            const newUser = await new UserModel({
                username: profile.username,
                githubId: profile.id,
                token: accessToken,
            }).save();

            const response = await axios({
                url: `https://api.github.com/users/${newUser.username}/repos`,
                headers: { Authorization: `token ${newUser.token}` },
                params: { type: 'all' },
            });

            for(repo of response.data) {
                const response = await axios({
                    url: `https://api.github.com/repos/${repo.full_name}/traffic/views`,
                    headers: { Authorization: `token ${newUser.token}` },
                });
                const { count, uniques } = response.data;
                let { views } = response.data;
                const today = new Date();
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

                await new RepositoryModel({
                    user_id: newUser._id,
                    reponame: repo.full_name,
                    count: count,
                    uniques: uniques,
                    views: views
                }).save();
            }

            done(null, newUser);
        }
    }),
);
