var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

router.put('/batchsubscribe', function(req, res, next) {
  var userId = req.query.userId; 
  var rooms = JSON.parse(req.query.rooms); 

  socketApi.batchSubscribe(userId, rooms); 
  res.status(200).json({ msg: 'Subscribed' });
}); 

router.post('/notify', function(req, res, next) {
  var room = req.query.room; 
  var msg = req.query.msg; 

  socketApi.notifyRoom(room, msg);

  res.send("Sent");
});

module.exports = router;
