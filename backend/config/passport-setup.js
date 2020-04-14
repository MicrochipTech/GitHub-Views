const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const GitHubApiCtrl = require("../controllers/GitHubApiCtrl");
const RepositoryModel = require("../models/Repository.js");
const UserModel = require("../models/User");
const TokenModel = require("../models/Token");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id);
  done(null, user);
});

passport.use(
  new LocalStrategy(function(username, password, callback) {
    UserModel.findOne({ username }, function(err, user) {
      if (err) {
        return callback(err);
      }

      if (!user) {
        return callback(null, false, { message: "No user found." });
        // return callback("No user found.");
      }

      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          return callback(err);
        }
        if (!isMatch) {
          return callback(null, false, { message: "Invalid login." });
          // return callback("Invalid login.");
        }
        return callback(null, user);
      });
    });
  })
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GH_CLIENT_ID,
      clientSecret: process.env.GH_CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      const currentUser = await UserModel.findOne({ githubId: profile.id });

      if (currentUser) {
        // Delete old token
        await TokenModel.deleteOne({ _id: currentUser.token_ref });
        // Creae new token
        const t = await new TokenModel({ value: accessToken }).save();
        // Update user
        currentUser.token_ref = t._id;
        await currentUser.save();

        done(null, currentUser);
      } else {
        console.log("Creating new user");

        const t = await new TokenModel({ value: accessToken })
          .save()
          .catch(e => console.log("Error saveing token for new user."));

        const newUser = await new UserModel({
          username: profile.username,
          githubId: profile.id,
          token_ref: t._id
        })
          .save()
          .catch("Error saveing new user.");

        const repos = await GitHubApiCtrl.getUserRepos(newUser, t.value);

        const promises = repos.map(async repo => {
          await GitHubApiCtrl.createNewUpdatedRepo(repo, newUser._id, t.value)
          .catch(e => console.log(`Fail creating repository ${repo.reponame}`));
        });
        await Promise.all(promises);

        done(null, newUser);
      }
    }
  )
);
