const UserModel = require('../models/User');
const RepoModel = require('../models/Repository');

module.exports = {
    home: async (req, res) => {
        if (req.user) {
            const userRepos = await RepoModel.find({ user_id: req.user._id });
            const user = await UserModel.findById(req.user._id).populate('sharedRepos');
            const dataToPlot = { userRepos, sharedRepos: user.sharedRepos };
            res.render('account', { user: req.user, data: dataToPlot });
        } else {
            res.render('index');
        }
    },
};
