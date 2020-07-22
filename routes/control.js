var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

var notifyRouter = require('./notify');
var searchRouter = require('./search');

router.use('/notify', notifyRouter);
router.use('/search', searchRouter);

// subscribe user to one or more rooms
router.put('/subscribe', function(req, res, next) {
  var userId = req.query.userId; 
  var channels = JSON.parse(req.query.channels); 

  // subscribe user socket to rooms 
  console.log('subscribe hit');
  socketApi.subscribe(userId, channels); 
  res.status(200).json({ msg: 'Subscribed' });
}); 



router.put('/unsubscribe', function(req, res, next) {
  
  console.log('unsubscribe hit');
  
  var userId = req.query.userId; 
  var channel = req.query.channel; 

  
  socketApi.unsubscribe(userId, channel); 
  res.send("Unsubscribed");
});


module.exports = router;
