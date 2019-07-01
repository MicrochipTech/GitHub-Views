var Datastore = require('nedb');
var path = require('path');
db_location = path.join(__dirname, '..', 'users.db');
db_location= db_location.replace(/\\/g,"/");
users_db = new Datastore({ filename: db_location, autoload: true });

// class User {
//     constructor(username, password) {
//         this.username = username
//         this.password = password
//     }
// }

module.exports = users_db