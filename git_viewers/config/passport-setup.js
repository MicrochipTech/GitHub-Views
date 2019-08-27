var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // User.findById(id, function(err, user) {
    //     done(null, user.id);
    // });
    User.findById(id).then((user)=> {
        done(null, user);
    });
});

passport.use(
    new GitHubStrategy({
        clientID: '03963de3c3c3f3cc309a',
        clientSecret: '49309e90a3564ff1e07469db3758cadea2394f3c',
        callbackURL: '/auth/github/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        //console.log(profile);

        // User.findOne({githubId: profile.id}, function (err, currentUser) {
        //     if(currentUser){
        //         //console.log('user is: ' + currentUser);
        //         done(err, currentUser);
        //     } else {
        //         new User({
        //             username: profile.username,
        //             githubId: profile.id 
        //         }).save().then((newUser) => {
        //             //console.log('new user created: ' + newUser);
        //             done(err, newUser);
        //         });
        //     }
        // });

        User.findOne({githubId: profile.id}).then((currentUser) => {
            if(currentUser){
                //console.log('user is: ' + currentUser);
                done(null, currentUser);
            } else {
                new User({
                    username: profile.username,
                    githubId: profile.id 
                }).save().then((newUser) => {
                    //console.log('new user created: ' + newUser);
                    done(null, newUser);
                });
            }
        });
    })
);