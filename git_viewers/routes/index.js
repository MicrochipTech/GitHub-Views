var express = require('express');
var router = express.Router();
var usersRouter = require('./user-routes');
var repositoryCtrl = require('../controllers/RepositoryCtrl');
var userCtrl = require('../controllers/UserCtrl');

var dummyData = {
  sharedRespo: null,
  myRepos: [
    {
      repoName: "m17336/githubViews",
      repoId: "123",
      history: [{
        timestamp: new Date(),
        views: 10,
        unique: 2,
      },{
        timestamp: new Date()-1,
        views: 13,
        unique: 2,
      },{
        timestamp: new Date()-2,
        views: 4,
        unique: 1,
      },{
        timestamp: new Date()-3,
        views: 10,
        unique: 6,
      },{
        timestamp: new Date()-4,
        views: 5,
        unique: 3,
      },]
    },
    {
      repoName: "m17336/letest",
      repoId: "124",
      history: [{
        timestamp: new Date(),
        views: 100,
        unique: 3,
      },{
        timestamp: new Date()-1,
        views: 7,
        unique: 3,
      },{
        timestamp: new Date()-2,
        views: 1,
        unique: 1,
      },{
        timestamp: new Date()-3,
        views: 6,
        unique: 1,
      },{
        timestamp: new Date()-4,
        views: 5,
        unique: 2,
      },]
    },
  ],
}

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
        console.log(dataToPlot);
        res.render('account', {user: req.user, data: dataToPlot});
      });
    });
    
  } else {
    res.render('index');
  }

  // if(foame) by iustinian bujor
  //   mananca;
});

module.exports = router;
