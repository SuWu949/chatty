/*
 * Node app entry file
 */

// Load environment variables
console.log(require('dotenv').config());
const config = require('./config/config');

// Import modules
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var createError = require('http-errors');


var passport = require('./config/passportAuth').passport;
var router = require('./routes');
var app = express();

// Set middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());              // TODO: specify origins to be more restrictive
app.use(express.json({limit: config.app.reqLimit}));
app.use(express.urlencoded({limit: config.app.reqLimit, extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/node_modules'));
app.use(passport.initialize());

// Connect all routes to app
app.use('/', router);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;