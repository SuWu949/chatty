var express = require('express');
var router = express.Router();

var socketApi = require('../socketApi');
var io = socketApi.io;


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("in index.js");
  res.render('index', { title: 'Express' });
  
});

socketApi.sendNotification();

io.on('hello', (msg) =>  {
  console.log("msg: " + msg);
});

module.exports = router;
