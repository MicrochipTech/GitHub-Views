const router = require('express').Router();
const repoCtrl = require('../controllers/RepositoryCtrl');

router.post('/share', repoCtrl.share);

module.exports = router;
