const router = require('express').Router();
const aggCharstCtrl = require('../controllers/AggregateChartController');

router.get('/getAllForCurrentUser', aggCharstCtrl.getAllForCurrentUser);
router.get('/create', aggCharstCtrl.create);
router.get('/addRepo', aggCharstCtrl.addRepo);
router.get('/delete', aggCharstCtrl.delete);

module.exports = router;
