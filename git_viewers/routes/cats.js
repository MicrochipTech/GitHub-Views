
var express = require('express');
var router = express.Router();

var catCtrl = require('../controllers/CatCtrl');

router.get('/', function(req, res, next) {
  catCtrl.getAll().then((data) => {
    res.render('cats', { title: 'CATS', users: data });
  });
});

router.post('/', (req, res) => {
  catCtrl.create(req.body.catName)
  .then(() => {
      res.redirect('/cats');
  })
  .catch(err => {
    console.log(err);
  })
});

module.exports = router;
