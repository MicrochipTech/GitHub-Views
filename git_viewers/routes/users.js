var express = require('express');
var router = express.Router();

var User = require('../models/User')
var users = require('../controllers/UserCtrl')

router.get('/', function(req, res, next) {
  users.getAllUsers().then((data) => {
    // res.json(data);
    res.render('users', { title: 'USERS', users: data });
  });
  
});

module.exports = router;