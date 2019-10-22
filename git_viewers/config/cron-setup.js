var cron = require('node-cron');
var repositoryCtrl = require('../controllers/RepositoryCtrl');
var userCtrl = require('../controllers/UserCtrl');
var axios = require('axios');
var fs = require('fs');

function test() {

    let rawdata = fs.readFileSync('/usr/app/config/dat.json');
    let data = JSON.parse(rawdata);

    repositoryCtrl.getRepoById('5da47a339c48760059db7363').then( (testRepo) => {
        
        viewsToUpdate = data.views;
        if(testRepo.count != 0){
            viewsToUpdate = data.views.filter(info => 
                (new Date(info.timestamp)) > (testRepo.views[testRepo.views.length - 1].timestamp));
        }

        for (let view of viewsToUpdate) {
            var viewData = {
                timestamp: new Date(view.timestamp),
                count: Number(view.count),
                uniques: Number(view.uniques)
            }

            testRepo.count += viewData.count;
            testRepo.uniques += viewData.uniques;
            testRepo.views.push(viewData);
        }
        
        testRepo.save();
    });
}

function updateRepos() {
    repositoryCtrl.getAllWithPopulate('User').then((repos) => {
        for (let repoEntry of repos) {

            axios({
                url: 'https://api.github.com/repos/' + repoEntry.reponame + '/traffic/views',
                headers: {'Authorization': 'token ' + repoEntry.user_id.token}
            })
            .then(function (response) {

                viewsToUpdate = response.data['views'];
                if(repoEntry != 0){
                    viewsToUpdate = response.data['views'].filter(info => (new Date(info.timestamp)) > (repoEntry.views[repoEntry.views.length - 1].timestamp))
                }
                for (let view of viewsToUpdate) {

                    var viewData = {
                        timestamp: new Date(view.timestamp),
                        count: Number(view.count),
                        uniques: Number(view.uniques)
                    }

                    repoEntry.count += viewData.count;
                    repoEntry.uniques += viewData.uniques;
                    repoEntry.views.push(viewData);
                }
                repoEntry.save();
            })
            .catch(function (error) {
            console.log(error);
            })
            .then(function () {
            // always executed
            });
        }
    });
}

cron.schedule('11 0 * * monday', () => {
    console.log('running a task every monday at 11:00');
    updateRepos();
});

// cron.schedule('*/1 * * * *', () => {
//     console.log('running a task every monday at 11:00');
//     test();
// });
