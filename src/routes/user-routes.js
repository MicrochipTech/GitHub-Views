const router = require("express").Router();
const userCtrl = require("../controllers/UserCtrl");

router.get("/startsWith", userCtrl.getWhereUsernameStartsWith);

module.exports = router;
