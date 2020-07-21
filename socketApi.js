var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};
var socketConnections = {}; 
var tempCounter = 0; 


socketApi.io = io;

io.on('connection', function(socket){

    tempCounter += 1;

    // add socket into dictionary 
    socketConnections[tempCounter] = socket;
    console.log('User ' + tempCounter + " connected with socket.id: " + socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('chat message', (msg) => {
       console.log('message: ' + msg);
       io.emit('chat message', msg);
    });

});

var batchSubscribe = (userId, rooms) => {

    var userSocket = socketConnections[userId];
    userSocket.join(rooms, () => {
        const subscriptions = Object.keys(userSocket.rooms);
        console.log(subscriptions);
    });
};

var notifyRoom = (room, msg) => {
    io.to(room).emit('chat message', msg);
}

module.exports = {
    io: io,  
    batchSubscribe: batchSubscribe, 
    notifyRoom: notifyRoom

};