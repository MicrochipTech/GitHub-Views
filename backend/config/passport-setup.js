const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const UserCtrl = require("../controllers/UserCtrl");
const UserModel = require("../models/User");
const TokenModel = require("../models/Token");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user;
  try {
    user = await UserModel.findById(id);
  } catch(err) {
    // TODO
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
      clientSecret: process.env.GH_CLIENT_SECRET
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
      } catch(err) {
        // TODO
      }

      if (currentUser) {

        /* The GitHub user was found in the database, so we will update its latest token */
        let t;
        try {
          await TokenModel.deleteOne({ _id: currentUser.token_ref }); /* Delete old token */
          t = await new TokenModel({ value: accessToken }).save(); /* Create new token */
          currentUser.token_ref = t._id; /* Update user */
          await currentUser.save();
        } catch(err) {
          // TODO
        }

        done(null, currentUser);
      } else {
        /* The GitHub user was not found in the database, so we will create it */
        console.log("Creating new user");

        /* Create new token */
        let t;
        try {
          t = await new TokenModel({ value: accessToken }).save();
        } catch (err) {
          // TODO
          console.log("Error saveing token for new user.")
        }

        let  newUser;
        try {
          newUser = await new UserModel({
            username: profile.username,
            githubId: profile.id,
            token_ref: t._id
          }).save();
        } catch(err) {
          // TODO
          console.log("Error saveing new user.");
        }

        /* Start tracking the user's repositories from the GitHub account. */
        try {
          await UserCtrl.checkForNewRepos(newUser, t.value);
        } catch(err) {
          // TODO
        }

        done(null, newUser);
      }
    }
  )
);
