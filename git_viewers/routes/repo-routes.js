var router = require('express').Router();
var axios = require('axios');
var userCtrl = require('../controllers/UserCtrl');
var repositoryCtrl = require('../controllers/RepositoryCtrl');

router.get('/', (req, res) => {
  repositoryCtrl.getAllWithPopulate('user_id').then((data) => {
    res.send(data.map(repo => repo['user_id'].username));
  });
});

router.get('/fetch', (req, res) => {
  axios({
      url: 'http://localhost:8082/data.json',
  })
  .then(function (response) {
      console.log(response.toJSON());
  })
  .catch(function (error) {
  console.log(error);
  })
  .then(function () {
  // always executed
  });
});

/* Get repos */
router.get('/names', (req, res) => {
  userCtrl.getUserById(req.user.id).then((user) => {
    axios({
      url: 'https://api.github.com/users/' + user.username +'/repos',
      headers: {'Authorization': 'token ' + user.token}
    })
    .then(function (response) {
      var name_arr = response.data.map(repo => repo['name']);
      res.send(name_arr);
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  });
});

router.post('/share', function(req, res, next) {

  var repoId = req.body.repoId;
  var username = req.body.username;

  userCtrl.getUserByUsername(username).then((userr) => {
    userr.sharedRepos.push({"repoId": repoId});
    userr.save();
  });
  
  res.send("Success sharing the repo!");
})

module.exports = router;