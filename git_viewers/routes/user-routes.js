const express = require('express');
const userCtrl = require('../controllers/UserCtrl');

const router = express.Router();

router.get('/startsWith', userCtrl.getWhereUsernameStartsWith);

module.exports = router;
