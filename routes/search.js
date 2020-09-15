var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// Get subscriptions by userId
router.get('/subscriptions', function(req, res, next) {
    var userId = req.query.userId; 
  
    var channels = socketApi.getSubscriptions(userId);
    console.log('Subscriptions: ' + channels);

    res.send(channels);
  });


// Get participants in channel
router.get('/participants', function(req, res, next) {
    var channel = req.query.channel; 

    // console.log('req: ' + JSON.stringify(req));

    console.log('in route');
    console.log('channel: ' + channel);
    var users = socketApi.getParticipants(channel);

    res.send(users);
});

module.exports = router;