const passport = require("passport");

module.exports = {
  login: (req, res) => {
    res.render("login");
  },

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
  }
};
