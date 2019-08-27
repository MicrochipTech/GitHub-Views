var router = require('express').Router();
var passport = require('passport');

/* Auth login */
router.get('/login', (req, res) => {
    res.render('login');
});

/* Auth logout */
router.get('/logout', (req, res) => {
    // handle with passport
    res.send('logging out');
});

/* Auth with GitHub */
router.get('/github', passport.authenticate('github', {
    scope: ['profile']
}));

/* Callback route */
router.get('/github/redirect', passport.authenticate('github'), (req, res) => {
    //res.send(req.user);
    res.redirect('/profile/')
});

module.exports = router;