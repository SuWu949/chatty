var express = require('express');
var router = express.Router();

var controlRouter = require('./control');


var socketApi = require('../socketApi');
var io = socketApi.io;

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.status(200).json({ message: 'Connected!' });
  res.render('index', { title: 'Express' });
  
});

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   io.emit('greeting', 'hello, how are you emit');
//   socket.emit('greeting', 'hello, how are you?'); 

//   socket.on('reply', (msg) => {
//       console.log('reply received: ' + msg);
//   });


// });





// socketApi.sendNotification();

// io.on('hello', (msg) =>  {
//   console.log("msg: " + msg);
// });

// io.on('reply', (msg) => {
//   console.log('reply: ' + msg);
// });




router.use('/control', controlRouter);


module.exports = router;
