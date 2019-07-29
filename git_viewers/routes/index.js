var express = require('express');
var router = express.Router();
var usersRouter = require('./users');
var catsRouter = require('./cats');

router.use('/users', usersRouter);
router.use('/cats', catsRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
