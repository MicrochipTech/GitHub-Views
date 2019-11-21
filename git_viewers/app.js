const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
//const cron = require('node-cron');
require('./config/passport-setup');
require('./config/cron-setup');

mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo/app?authSource=admin`, { useNewUrlParser: true });

// cron.schedule('11 0 * * monday', () => {
//   console.log('running a task every monday at 11:00');
// });

const routes = require('./routes');

const app = express();

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
    keys: ['encrypt_cookie_key'],
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
