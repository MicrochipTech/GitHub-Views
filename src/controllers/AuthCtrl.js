const passport = require("passport");
const UserModel = require("../models/User");

module.exports = {
  logout: (req, res) => {
    req.logout();
    res.redirect("/");
  },

  github: passport.authenticate("github", {
    scope: ["user", "repo"]
  }),

  githubCallback: passport.authenticate("github"),

  redirectHome: (req, res) => {
    res.redirect("/");
  },

  localLogin: (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send({ info });
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.send({ info });
      });
    })(req, res, next);
  },

  localRegister: async (req, res) => {
    console.log("register....", req.body.username, req.body.password);
    const { username, password } = req.body;
    try {
      const user = await UserModel({ username, password }).save();
      console.log(user);
      res.json({ success: true, user });
    } catch (error) {
      res.send({ success: false, error });
    }
  }
};
