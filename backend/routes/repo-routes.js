const router = require("express").Router();
const repoCtrl = require("../controllers/RepositoryCtrl");

router.post("/share", repoCtrl.share);
router.get("/sync", repoCtrl.sync);
router.post("/updateForksTree", repoCtrl.updateForksTree)

module.exports = router;
