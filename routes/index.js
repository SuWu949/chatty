var express = require('express');
var router = express.Router();

var controlRouter = require('./control');


var socketApi = require('../socketApi');
var io = socketApi.io;

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.status(200).json({ message: 'Connected!' });
  res.render('index', { title: 'Toy Chat' });
  
});

// socketApi.sendNotification();

router.use('/control', controlRouter);


module.exports = router;
