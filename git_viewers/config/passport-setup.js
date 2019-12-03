const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const axios = require("axios");
const RepositoryModel = require("../models/Repository.js");

const UserModel = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id);
  done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GH_CLIENT_ID,
      clientSecret: process.env.GH_CLIENT_SECRET,
      callbackURL: "/auth/github/redirect"
    },
    async (accessToken, refreshToken, profile, done) => {
      const currentUser = await UserModel.findOne({ githubId: profile.id });

      if (currentUser) {
        const updatedUser = await UserModel.findOneAndUpdate(
          {
            githubId: profile.id
          },
          {
            token: accessToken
          }
        );
        done(null, updatedUser);
      } else {
        const newUser = await new UserModel({
          username: profile.username,
          githubId: profile.id,
          token: accessToken
        }).save();

        const response = await axios({
          url: `https://api.github.com/users/${newUser.username}/repos`,
          headers: { Authorization: `token ${newUser.token}` },
          params: { type: "all" }
        });

        const promises = response.data.map(async repo => {
          const repoTrafficResponse = await axios({
            url: `https://api.github.com/repos/${repo.full_name}/traffic/views`,
            headers: { Authorization: `token ${newUser.token}` }
          });
          const { count, uniques } = repoTrafficResponse.data;
          let { views } = repoTrafficResponse.data;
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);

          views = views.filter(info => {
            const infoTimestamp = new Date(info.timestamp);

            if (infoTimestamp.getTime() < today.getTime()) {
              return true;
            }

            return false;
          });

          await new RepositoryModel({
            user_id: newUser._id,
            reponame: repo.full_name,
            count,
            uniques,
            views
          }).save();
        });
        await Promise.all(promises);

        done(null, newUser);
      }
    }
  )
);
