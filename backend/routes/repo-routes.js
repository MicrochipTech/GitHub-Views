const router = require("express").Router();
const repoCtrl = require("../controllers/RepositoryCtrl");

router.post("/share", repoCtrl.share);
router.post("/updateForksTree", repoCtrl.updateForksTree);
router.get("/sync", repoCtrl.sync);
router.get("/nameContains", repoCtrl.nameContains);

module.exports = router;
