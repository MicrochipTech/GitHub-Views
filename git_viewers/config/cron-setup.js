const cron = require('node-cron');
const axios = require('axios');
const repositoryCtrl = require('../controllers/RepositoryCtrl');

function updateRepos() {
    const currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(0, 0, 0, 0);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    repositoryCtrl.getAllWithPopulate('user_id').then((repos) => {
        for (let repoIndex = 0; repoIndex < repos.length; repoIndex += 1) {
            const repoEntry = repos[repoIndex];

            axios({
                url: `https://api.github.com/repos/${repoEntry.reponame}/traffic/views`,
                headers: { Authorization: `token ${repoEntry.user_id.token}` },
            })
                .then((response) => {
                    let timeIndex = oneWeekAgo;

                    if (repoEntry.views.length !== 0) {
                        timeIndex = repoEntry.views[repoEntry.views.length - 1].timestamp;
                        timeIndex.setDate(oneWeekAgo.getDate() + 1);
                    }

                    const viewsToUpdate = response.data.views.filter(
                        (info) => (new Date(info.timestamp)) >= timeIndex,
                    );
                    const days = (timeIndex.getTime() - currentTime.getTime()) / (1000 * 3600 * 24);

                    let index = 0;

                    while (index < days) {
                        if (viewsToUpdate[index] === undefined) {
                            viewsToUpdate.push({
                                timestamp: timeIndex.toISOString(),
                                count: 0,
                                uniques: 0,
                            });
                        } else if (timeIndex < new Date(viewsToUpdate[index].timestamp)) {
                            viewsToUpdate.splice(index, 0, {
                                timestamp: timeIndex.toISOString(),
                                count: 0,
                                uniques: 0,
                            });
                        }

                        timeIndex.setDate(timeIndex.getDate() + 1);
                        index += 1;
                    }

                    for (let viewIndex = 0; viewIndex < viewsToUpdate.length; viewIndex += 1) {
                        const view = viewsToUpdate[viewIndex];

                        const viewData = {
                            timestamp: new Date(view.timestamp),
                            count: Number(view.count),
                            uniques: Number(view.uniques),
                        };

                        repoEntry.count += viewData.count;
                        repoEntry.uniques += viewData.uniques;
                        repoEntry.views.push(viewData);
                    }

                    repoEntry.save();
                })
                .catch((error) => {
                    console.log(error);
                })
                .then(() => {
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
