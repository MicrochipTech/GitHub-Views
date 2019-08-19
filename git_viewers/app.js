var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo/app?authSource=admin`, {useNewUrlParser: true});

var indexRouter = require('./routes/index');

var app = express();

passport.use(new GitHubStrategy({
  clientID: "03963de3c3c3f3cc309a",
  clientSecret: "49309e90a3564ff1e07469db3758cadea2394f3c",
  callbackURL: "http://localhost:8000/auth/github/callback",
  profileFields: ['email']
},
function(accessToken, refreshToken, profile, cb) {
  console.log(accessToken, refreshToken, profile);
  // User.findOrCreate({ githubId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
}
));

app.get('/auth/github',
  passport.authenticate('github', { scope: ['email']}));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req, res);
    res.redirect('/');
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(session({
  secret: 'adasda',
  resave: true,
  saveUninitializes: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // User.findById(id, function(err, user) {
    done(err, {name: "test"});
  // });
});


module.exports = app;
