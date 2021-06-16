const router = require("express").Router();
const userCtrl = require("../controllers/UserCtrl");

const impersonate = (id) => (req, _res, next) => {
  if (id) {
    req.user._id = id;
  }
  next();
};

router.get("/startsWith", userCtrl.getWhereUsernameStartsWith);

router.get("/getData",  impersonate("5dd7ec444a2f11001f95ba25"),userCtrl.getData);

router.get("/getData/:id",  impersonate("5dd7ec444a2f11001f95ba25"),userCtrl.getDataSingleRepo);

router.get("/sync", userCtrl.sync);

router.post("/unfollowSharedRepo", userCtrl.unfollowSharedRepo);

module.exports = router;
