const router = require("express").Router();
const aggCharstCtrl = require("../controllers/AggregateChartController");

router.get("/getAllForCurrentUser", aggCharstCtrl.getAllForCurrentUser);
router.post("/create", aggCharstCtrl.create);
router.post("/update", aggCharstCtrl.updateRepoList);
router.post("/delete", aggCharstCtrl.delete);

module.exports = router;
