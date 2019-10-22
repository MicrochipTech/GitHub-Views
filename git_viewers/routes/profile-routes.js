var router = require('express').Router();

router.get('/', (req, res)=> {
    console.log(req.user);
    res.send('Logged as:' + 
    ' username: ' + req.user.username +
    ', githubId: ' + req.user.githubId);
});

module.exports = router;