const router = require("express").Router();
const userCtrl = require("../controllers/UserCtrl");

const impersonate = (id) => (req, _res, next) => {
  if (id) {
    req.user._id = id;
  }
  next();
};

router.get("/startsWith", userCtrl.getWhereUsernameStartsWith);

router.get("/getData", userCtrl.getData);

router.get("/getData/:id", userCtrl.getDataSingleRepo);

router.get("/sync", userCtrl.sync);

router.post("/unfollowSharedRepo", userCtrl.unfollowSharedRepo);

module.exports = router;
