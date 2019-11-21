const router = require('express').Router();
const authRoutes = require('./auth-routes');
const repoRoutes = require('./repo-routes');
const userRoutes = require('./user-routes');
const aggregateChartsRoutes = require('./aggregateCharts-routes');
const indexCtrl = require('../controllers/IndexCtrl');

router.get('/', indexCtrl.home);

router.use('/auth', authRoutes);
router.use('/repo', repoRoutes);
router.use('/user', userRoutes);
router.use('/aggCharts', aggregateChartsRoutes);

module.exports = router;
