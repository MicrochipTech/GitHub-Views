const router = require("express").Router();
const repoCtrl = require("../controllers/RepositoryCtrl");

router.post("/share", repoCtrl.share);
router.get("/sync", repoCtrl.sync);

module.exports = router;
