var express = require('express');
var router = express.Router();

var userCtrl = require('../controllers/UserCtrl');

router.get('/all', function(req, res, next) {
  userCtrl.getAll().then((data) => {
    // res.json(data);
    res.render('users', { title: 'USERS', users: data });
  });

});

module.exports = router;
