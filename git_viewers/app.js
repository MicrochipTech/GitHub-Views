var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var passportSetup = require('./config/passport-setup');
var cookieSession = require('cookie-session');
var passport = require('passport');
var cron = require('node-cron');

var authRoutes = require('./routes/auth-routes');
var profileRoutes = require('./routes/profile-routes');

mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo/app?authSource=admin`, {useNewUrlParser: true});

cron.schedule('11 0 * * monday', () => {
  console.log('running a task every monday at 11:00');
});

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['encrypt_cookie_key']
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

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


module.exports = app;
