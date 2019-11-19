const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const repositoryCtrl = require('../controllers/RepositoryCtrl');
const userCtrl = require('../controllers/UserCtrl');

function updateRepos() {

    var current_time = new Date();
    current_time.setHours(0, 0, 0, 0);

    var one_week_ago = new Date();
    one_week_ago.setHours(0, 0, 0, 0);
    one_week_ago.setDate(one_week_ago.getDate() - 7);

    repositoryCtrl.getAllWithPopulate('User').then((repos) => {
        
        for (let repoEntry of repos) {
            console.log(repoEntry.reponame + " " + repoEntry.user_id.token);
            axios({
                url: 'https://api.github.com/repos/' + repoEntry.reponame + '/traffic/views',
                headers: {'Authorization': 'token ' + repoEntry.user_id.token}
            })
            .then(function (response) {
                time = one_week_ago;

                if(repoEntry.views.length != 0){
                    time = repoEntry.views[repoEntry.views.length - 1].timestamp;
                    time.setDate(one_week_ago.getDate() + 1);
                } 
                
                var viewsToUpdate = response.data['views'].filter(info => (new Date(info.timestamp)) >= time);
                days = (time.getTime() - current_time.getTime()) / (1000 * 3600 * 24);
                var index = 0;

                while(index < days) {
                    if(viewsToUpdate[index] == undefined) {
                        viewsToUpdate.push({ timestamp: time.toISOString(), count: 0, uniques: 0});
                    } else if(time < new Date(viewsToUpdate[index].timestamp)){
                        viewsToUpdate.splice(index, 0, { timestamp: time.toISOString(), count: 0, uniques: 0});
                    }

                    time.setDate(time.getDate() + 1);
                    ++index;
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
            //console.log(error);
            })
            .then(function () {
            // always executed
            });
        }
    });
}

// cron.schedule('11 0 * * monday', () => {
//     console.log('running a task every monday at 11:00');
//     updateRepos();
// });

cron.schedule('*/1 * * * *', () => {
    console.log('running task every minute');
    updateRepos();
});