const router = require("express").Router();
const aggCharstCtrl = require("../controllers/AggregateChartController");

router.get("/getAllForCurrentUser", aggCharstCtrl.getAllForCurrentUser);
router.post("/create", aggCharstCtrl.createChart);
router.post("/update", aggCharstCtrl.updateRepoList);
router.post("/delete", aggCharstCtrl.deleteChart);

module.exports = router;
