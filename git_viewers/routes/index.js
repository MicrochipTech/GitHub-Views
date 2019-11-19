const router = require('express').Router();
const indexCtrl = require('../controllers/IndexCtrl');

router.get('/', indexCtrl.home);

module.exports = router;
