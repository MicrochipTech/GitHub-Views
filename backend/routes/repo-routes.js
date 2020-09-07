const router = require("express").Router();
const repoCtrl = require("../controllers/RepositoryCtrl");

router.post("/share", repoCtrl.share);
router.post("/updateForksTree", repoCtrl.updateForksTree);
router.get("/nameContains", repoCtrl.nameContains);
router.get("/publicRepos", repoCtrl.getPublicRepos);

module.exports = router;
