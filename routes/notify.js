var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

router.post('/channel', function(req, res, next) {
    var channel = req.query.channel; 
    var msg = req.query.msg; 
  
    socketApi.notifyChannel(channel, msg);
  
    res.send("Sent");
  });

module.exports = router;