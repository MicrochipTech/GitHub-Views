var user_model = require('../models/User')

module.exports = {
    getAll: function () {
        return new Promise((resolve, reject) => {
            user_model.find({}, function (err, docs) {
                resolve(docs)
                console.log(docs);
            })
        });
    }
}
