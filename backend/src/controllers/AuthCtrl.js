const passport = require("passport");
const UserModel = require("../models/User").default;

module.exports = {
  logout: (req, res) => {
    req.logout();
    res.redirect("/");
  },

  me: async (req, res) => {
    if (req.user != null) res.json(req.user);
    else res.status(404).send("No user");
  },

  github: passport.authenticate("github", {
    scope: ["user", "repo"],
  }),

  githubCallback: passport.authenticate("github"),

  redirectHome: (req, res) => {
    res.redirect("/");
  },

  msft: (req, res, next) => {
    passport.authenticate("azuread-openidconnect", {
      response: res,
      failureRedirect: "/",
    })(req, res, next);
  },
};
