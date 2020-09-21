/*
 * Router for search endpoints
 */

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');
const { expressionToConstant } = require('constantinople');

// Get all channel subscriptions by userId
router.get('/subscriptions', function(req, res, next) {
    var userId = req.query.userId; 

    if (userId in socketApi.socketConnections) {
      var channels = socketApi.getSubscriptions(userId);
      if (channels != null) {
        res.status(200).send(channels);
      } else {
        res.status(500);
      }
    } else {
      res.status(400).json({msg: 'User does not exist.'});
    }
  });

// Get userIds subscribed to channel
router.get('/participants', function(req, res, next) {
    var channel = req.query.channel; 
    var users = socketApi.getParticipants(channel);

    if (users != null) {
      res.status(200).send(users);
    } else {
      res.status(400).json({msg: 'Channel does not exist.'});
    }
});

module.exports = router;