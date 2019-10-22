var express = require('express');
var router = express.Router();
var usersRouter = require('./user-routes');

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

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user) {
    res.render('account', {user: req.user, data: dummyData})
  } else {
    res.render('index');
  }
});

module.exports = router;
