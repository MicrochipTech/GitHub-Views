var Datastore = require('nedb');
var path = require('path');
db_location = path.join(__dirname, '..', 'users.db');
db_location= db_location.replace(/\\/g,"/");
// users_db = new Datastore({ filename: 'C:/Users/M50673/Desktop/github_views/github_views/git_viewers/users.db', autoload: true })
console.log(db_location);
users_db = new Datastore({ filename: db_location, autoload: true });

users_db.find({}, function (err, docs) {
    console.log('users:');
    console.log(docs);
})
// class User {
//     constructor(username, password) {
//         this.username = username
//         this.password = password
//     }
// }

module.exports = users_db