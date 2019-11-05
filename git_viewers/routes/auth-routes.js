const router = require('express').Router();
const passport = require('passport');

/* Auth login */
router.get('/login', (req, res) => {
    res.render('login');
});

/* Auth logout */
router.get('/logout', (req, res) => {
    // handle with passport
    req.logout();
    res.redirect('/');
});

/* Auth with GitHub */
router.get('/github', passport.authenticate('github', {
    scope: ['user', 'repo'],
}));

/* Callback route */
router.get('/github/redirect', passport.authenticate('github'), (req, res) => {
    // res.send(req.user);
    res.redirect('/');
});

module.exports = router;
