var express = require('express');
var router = express.Router();

var User = require('../models/User')
var users = require('../controllers/UserCtrl')

router.get('/', function(req, res, next) {
  console.log("------------------\n");
  // res.json(users.getAllUsers())
  users.getAllUsers().then((data) => {
    res.json(data);
  });
  console.log("------------------\n");
});

module.exports = router;