var express = require('express');
var router = express.Router();
var usersRouter = require('./user-routes');
var repositoryCtrl = require('../controllers/RepositoryCtrl');
var userCtrl = require('../controllers/UserCtrl');

router.get('/test',function(req, res){
  res.render('test');
})

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user) {

    
    var userRepos;
    var sharedRepos = [];
    /* Get user repos */

    repositoryCtrl.getAllReposByUserId(req.user._id).then((data) => {
      userRepos = data;

      userCtrl.getUserByIdWithPopulate(req.user._id, 'sharedRepos').then((data) => {

        var dataToPlot = {
          userRepos: userRepos,
          sharedRepos: data.sharedRepos
        };
        
        res.render('account', {user: req.user, data: dataToPlot});
      });
    });
    
  } else {
    res.render('index');
  }
});

module.exports = router;
