const router = require("express").Router();
const userCtrl = require("../controllers/UserCtrl");

router.get("/startsWith", userCtrl.getWhereUsernameStartsWith);
router.get("/getData", userCtrl.getData);
router.get("/sync", userCtrl.sync);
router.post("/unfollowSharedRepo", userCtrl.unfollowSharedRepo);

module.exports = router;
