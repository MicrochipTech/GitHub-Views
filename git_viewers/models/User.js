var Datastore = require('nedb-fsync');
var path = require('path');
users_db = new Datastore({ filename: 'users.db', autoload: true });

// class User {
//     constructor(username, password) {
//         this.username = username
//         this.password = password
//     }
// }

module.exports = users_db
