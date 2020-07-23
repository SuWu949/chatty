var socket_io = require('socket.io');
// var bimap = require("bimap");

var io = socket_io();
var socketApi = {};
var socketConnections = {}; 
var tempCounter = 0; 


// var socketConnections2 = new BiMap;

socketApi.io = io;

io.on('connection', function(socket){

    tempCounter += 1;

    // add socket into dictionary 
    socketConnections[tempCounter] = socket;
    // socketConnections2.push(tempCounter, socket); //
    console.log('User ' + tempCounter + " connected with socket.id: " + socket.id);

    socket.emit('chat message', 'User ' + tempCounter + ' socket.id: ' + socket.id);

    socket.on('disconnect', () => {
        console.log('Socket ' + socket.id + ' disconnected');
    });

    socket.on('chat message', (msg) => {
       console.log('message: ' + msg);
       io.emit('chat message', msg);
    });

});

// subscribe a user socket to one or more rooms 
var subscribeByUser = (userIds, channels) => {

    for (var i = 0; i < userIds.length; i++) {

        var userId = userIds[i];
        if (userId in socketConnections) {

            var userSocket = socketConnections[userId];
            userSocket.join(channels);
            // // var userSocket = socketConnections2.key(userId); //
            // userSocket.join(channels, () => {
            //     const subscriptions = Object.keys(userSocket.rooms);
            //     console.log("All current subscriptions: " + subscriptions);
            // });
        } else {
            console.log('User not found.');
        }
    }
};

// subscribe all users subscribed to 'channels' to 'newChannels' as well
var subscribeByChannel = (channels, newChannels) => { 

    for (var i = 0; i < channels.length; i++) {
        
        var channel = channels[i];
        console.log('curr channel: ' + channel);

        var channelInfo = io.sockets.adapter.rooms[channel];
        if (typeof channelInfo !== 'undefined' && channelInfo) {
            
            //target channel exists (has sockets subscribed)
            var userSockets = Object.keys(channelInfo.sockets);
            console.log('userSockets: ' + userSockets);

            // subscribe all sockets subscribed to channel to newChannels as well
            userSockets.forEach(function(socketId) {

                // look up socket obj by id
                var socket = io.sockets.connected[socketId];
                socket.join(newChannels);
            });
        } 
    }
};

// unsubscribe a user from one room 
var unsubscribe = (userId, channel) => {

    var userSocket = socketConnections[userId]; 
    // var userSocket = socketConnections2.key(userId); //
    userSocket.leave(channel, () => {
        const subscriptions = Object.keys(userSocket.rooms);
        console.log("All current subscriptions: " + subscriptions);
    });
};

// send 'chat message' events to one specified room // make the event more general? (
// somehwere to read in your different event types declare in one file )
var notifyChannel = (channel, msg) => {
    io.to(channel).emit('chat message', msg);
};

// get channel subscriptions by userId
var getSubscriptions = (userId) => {
    var userSocket = socketConnections[userId]; 
    // var userSocket = socketConnections2.key(userId); //
    const subscriptions = Object.keys(userSocket.rooms);

    // removes socketId at index 0 
    var socketId = subscriptions.shift();
    return subscriptions;
};


// get participants (socket ids) in channel 
var getParticipants = (channel) => {

    var channelSockets= io.sockets.adapter.rooms[channel].sockets
    return channelSockets; 
};


module.exports = {
    io: io,  
    subscribeByUser: subscribeByUser, 
    unsubscribe: unsubscribe,
    notifyChannel: notifyChannel,
    getSubscriptions: getSubscriptions,
    getParticipants: getParticipants, 
    subscribeByChannel: subscribeByChannel

};