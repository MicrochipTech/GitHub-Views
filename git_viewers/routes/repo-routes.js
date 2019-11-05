const router = require('express').Router();
const userCtrl = require('../controllers/UserCtrl');

router.post('/share', (req, res) => {
    const { repoId, username } = req.body;

    userCtrl.getUserByUsername(username).then((user) => {
        if (user) {
            console.log(user);
            user.sharedRepos.push(repoId);
            user.save();
            res.send('Success sharing the repo!');
        } else {
            res.send('User not found!');
        }
    });
});

module.exports = router;
