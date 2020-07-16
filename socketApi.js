var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};


socketApi.io = io;

console.log("herehello");


io.on('connection', function(socket){
    console.log('A user connected');

    socket.emit('greeting', 'hello, how are you?'); 

    socket.on('reply', (msg) => {
        console.log('reply received: ' + msg);
       
    });


});

socketApi.sendNotification = function() {
    io.emit('hello', {msg: 'Hello World!2'});
    io.sockets.emit('hello', {msg: 'Hello World!'});
    console.log('in sendNotification');
}



module.exports = socketApi;
