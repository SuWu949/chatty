/*
 * Router for search endpoints
 */

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// Get all channel subscriptions by userId
router.get('/subscriptions', function(req, res, next) {
    var userId = req.query.userId; 

    // TODO: error check user exists
  
    var channels = socketApi.getSubscriptions(userId);
    console.log('Subscriptions: ' + channels);

    res.send(channels);
  });


// Get userIds subscribed to channel
router.get('/participants', function(req, res, next) {
    var channel = req.query.channel; 
    var users = socketApi.getParticipants(channel);

    // TODO: error check code
    res.send(users);
});

module.exports = router;