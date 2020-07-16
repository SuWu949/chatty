var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};


socketApi.io = io;

io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('chat message', (msg) => {
       console.log('message: ' + msg);
       io.emit('chat message', msg);
    });

});

socketApi.sendNotification = function() {
    io.emit('hello', {msg: 'Hello World!2'});
    io.sockets.emit('hello', {msg: 'Hello World!'});
    console.log('in sendNotification');
}



module.exports = socketApi;
