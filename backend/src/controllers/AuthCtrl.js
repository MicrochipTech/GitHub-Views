const passport = require("passport");
const CfgModel = require("../models/Config").default;

module.exports = {
  logout: (req, res) => {
    req.logout();
    res.redirect("/");
  },

  me: async (req, res) => {
    if (req.user != null) {
      const appConfig = {};
      const allRepoConfig = await CfgModel.findOne({forRepos:"all"});
      appConfig.forAllRepos = allRepoConfig;
      res.json({...req.user.toJSON(), appConfig});
    } else { 
      res.status(404).send("No user");
    }
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
