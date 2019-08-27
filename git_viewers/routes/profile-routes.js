var router = require('express').Router();

router.get('/', (req, res)=> {
    res.send('Logged as: ' + req.user.username);
});

module.exports = router;