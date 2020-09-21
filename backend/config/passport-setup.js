const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const UserCtrl = require("../controllers/UserCtrl");
const UserModel = require("../models/User");
const TokenModel = require("../models/Token");
const {logger, errorHandler} = require("../logs/logger");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user;
  try {
    user = await UserModel.findById(id);
  } catch (err) {
    errorHandler(
      `${arguments.callee.name}: Error caught when deserializing user with id ${id}.`,
      err
    );
  }
  done(null, user);
});

/* The login in this application cand be done by users through the LocalStrategy
or GitHub Strategy. */
passport.use(
  /* The LocalStrategy allows the users to access the applications, and visualize
  data of other repositories, from GitHub users, which logged into the application. */
  new LocalStrategy(function(username, password, callback) {
    UserModel.findOne({ username }, function(err, user) {
      if (err) {
        return callback(err);
      }

      if (!user) {
        return callback(null, false, { message: "No user found." });
      }

      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          return callback(err);
        }
        if (!isMatch) {
          return callback(null, false, { message: "Invalid login." });
        }
        return callback(null, user);
      });
    });
  })
);

passport.use(
  /* The GitHubStrategy allows GitHub users to track ther repositories for which
  they have push access */
  new GitHubStrategy(
    {
      clientID: process.env.GH_CLIENT_ID,
      clientSecret: process.env.GH_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      /* At the moment when this application was developed, the GitHub token generated for
      one user does not expire. But, only the last 10 tokens generated token will be
      valid. This is why, we will always store the last generated token. Also, the token
      generated by the GitHub OAuth2 API is a sensible information, so we will not store
      it in clear in the database (more information can be found in the Token.js file). */
      let currentUser;
      try {
        currentUser = await UserModel.findOne({ githubId: profile.id });
      } catch (err) {
        errorHandler(
          `${arguments.callee.name}: Error caught while getting from database the user with githubId ${profile.id}.`,
          err
        );
      }

      if (currentUser) {
        /* The GitHub user was found in the database, so we will update its latest token */
        logger.info(
          `${arguments.callee.name}: Updating token for user ${currentUser.username}...`
        );
        let t;
        try {
          await TokenModel.deleteOne({
            _id: currentUser.token_ref,
          }); /* Delete old token */
          t = await new TokenModel({
            value: accessToken,
          }).save(); /* Create new token */
          currentUser.token_ref = t._id; /* Update user */
          await currentUser.save();
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while updating token for user ${currentUser.username}.`,
            err
          );
        }

        done(null, currentUser);
      } else {
        /* The GitHub user was not found in the database, so we will create it */
        logger.info(`${arguments.callee.name}: Creating new user...`);

        /* Create new token */
        let t;
        try {
          t = await new TokenModel({ value: accessToken }).save();
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while saving token for the new user ${profile.username}.`,
            err
          );
        }

        let newUser;
        try {
          newUser = await new UserModel({
            username: profile.username,
            githubId: profile.id,
            token_ref: t._id,
          }).save();
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while saving new user ${profile.username}.`,
            err
          );
        }

        /* Start tracking the user's repositories from the GitHub account. */
        try {
          await UserCtrl.checkForNewRepos(newUser, t.value);
        } catch (err) {
          errorHandler(
            `${arguments.callee.name}: Error caught while getting new repos for the new created user ${profile.username}.`,
            err
          );
        }

        done(null, newUser);
      }
    }
  )
);
