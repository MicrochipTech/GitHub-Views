const express = require('express');
const repositoryCtrl = require('../controllers/RepositoryCtrl');
const userCtrl = require('../controllers/UserCtrl');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    if (req.user) {
        let userRepos;

        repositoryCtrl.getAllReposByUserId(req.user._id).then((data) => {
            userRepos = data;

            userCtrl.getUserByIdWithPopulate(req.user._id, 'sharedRepos').then((data) => {
                const dataToPlot = {
                    userRepos,
                    sharedRepos: data.sharedRepos,
                };
                console.log(dataToPlot);
                res.render('account', { user: req.user, data: dataToPlot });
            });
        });
    } else {
        res.render('index');
    }
});

module.exports = router;
