/*
 * Main routing entry point
 */

var express = require('express');
var router = express.Router();
var controlRouter = require('./control');
var authRouter = require('./auth');

router.use('/control', controlRouter);
router.use('/auth', authRouter);

// Chat sample render home page
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Sample Chat'});
});

module.exports = router;
