const router = require("express").Router();
const aggCharstCtrl = require("../controllers/AggregateChartController");

router.get("/getAllForCurrentUser", aggCharstCtrl.getAllForCurrentUser);
router.get("/create", aggCharstCtrl.create);
router.post("/update", aggCharstCtrl.updateRepoList);
router.get("/delete", aggCharstCtrl.delete);

module.exports = router;
