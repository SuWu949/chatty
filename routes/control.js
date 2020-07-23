var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

var notifyRouter = require('./notify');
var searchRouter = require('./search');
var subscriptionRouter = require('./subscription');

router.use('/notify', notifyRouter);
router.use('/search', searchRouter);
router.use('/subscription', subscriptionRouter);


module.exports = router;
