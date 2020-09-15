var socket_io = require('socket.io');
var passportAuth = require('./config/passportAuth'); 

var socketConnections = passportAuth.socketConnections;

var io = socket_io();

// require authentication for each socket connection
io.use(passportAuth.authorize());

io.on('connection', function(socket){

    socket.emit('chat message', {msg: 'User connected with socket: ' + socket.id});  // lookup user id? bimap
    console.log('Socket ' + socket.id + ' connected.');

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

        } else {
            console.log('User not found.');
        }
    }
    // setTimeout(() => {
    //                     console.log('Current subscriptions for user id: ' + userId);
    //                     console.log(JSON.stringify(Object.keys(userSocket.rooms)));
    //                 },
    //             1000);
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

// unsubscribe 'userIds' from 'channels'
var unsubscribeByUser = (userIds, channels) => { 

    for (var i = 0; i < userIds.length; i++) {

        var userId = userIds[i];
        var userSocket = socketConnections[userId];

        for (var j = 0; j < channels.length; j++) { 

            var channel = channels[j];
            userSocket.leave(channel);
        }
    }
};

// unsubscribe all users from 'channels'
var unsubscribeByChannel = (channels) => { 

    for (var i = 0; i < channels.length; i++) {

        var channel = channels[i];

        var channelInfo = io.sockets.adapter.rooms[channel];
        if (typeof channelInfo !== 'undefined' && channelInfo) {
            
            //target channel exists (has sockets subscribed)
            var userSockets = Object.keys(channelInfo.sockets);
            console.log('userSockets: ' + userSockets);

            // unsubscribe all sockets subscribed to channel 
            userSockets.forEach(function(socketId) {

                // look up socket obj by id
                var socket = io.sockets.connected[socketId];
                socket.leave(channel);
            });
        } 
    }

    // setTimeout(() => {
    //         console.log('Current subscriptions for user id: ' + userId);
    //         console.log(JSON.stringify(Object.keys(userSocket.rooms)));
    //         },
    //     1000);
}

// split into efficient and inefficient notify? with origin flag
// only once if uesr in multiple channels , no duplicate messages
var notifyChannels = (channels, eventName, eventParams, efficient) => {
    
    console.log('channels: ' + channels);
    console.log('eventName: ' + eventName);
    console.log('eventParams: ' + JSON.stringify(eventParams));

    if (efficient) {
        var emitStr = 'io';
        for (var i = 0; i < channels.length; i++) {

            var channel = channels[i];
            var newEmit = '.to(\'' + channel + '\')';
            emitStr += newEmit;
        }
        emitStr += '.emit(\'' + eventName + '\', ' + JSON.stringify(eventParams) + ');';
        eval(emitStr);

    } else {
        for (var i = 0; i < channels.length; i++) {

            var currChannel = channels[i];

            // with origin option (TODO make more general, put split on rails side + single quotes)
            var channelProperties = currChannel.split('-');

            eventParams["id"] = parseInt(channelProperties[channelProperties.length-1]);
            eventParams["type"] = channelProperties.slice(0, -1).join('-');
            // --- end origin option

            io.to(currChannel).emit(eventName, eventParams);
        }
    }
};

var notifyUsers = (userIds, eventName, eventParams) => {

    for (var i = 0; i < userIds.length; i++) {

        var userId = userIds[i];
        var socket = socketConnections[userId];

        io.to(socket.id).emit(eventName, eventParams);
    }
}

// get channel subscriptions by userId
var getSubscriptions = (userId) => {
    var userSocket = socketConnections[userId]; 
    // var userSocket = socketConnections2.key(userId); //
    const subscriptions = Object.keys(userSocket.rooms);

    // removes socketId at index 0 
    var socketId = subscriptions.shift();
    return subscriptions;
};

// get participants (userIds) in channel

var getParticipants = (channel) => {

    var channelSockets = io.sockets.adapter.rooms[channel].sockets;
    // console.log('channelSockets: ');
    // console.log( channelSockets);
    var userIds = [];

    Object.keys(channelSockets).forEach((socketId, index) => {
        var currUserId = Object.keys(socketConnections).find(key => socketConnections[key]['id'] == socketId);
        userIds.push(currUserId);
    });

    console.log('userIds: ' + userIds);
    return userIds;
};

module.exports = {
    io: io,  
    subscribeByUser: subscribeByUser, 
    subscribeByChannel: subscribeByChannel,
    unsubscribeByUser: unsubscribeByUser,
    unsubscribeByChannel: unsubscribeByChannel,
    notifyChannels: notifyChannels, 
    notifyUsers: notifyUsers,
    getSubscriptions: getSubscriptions,
    getParticipants: getParticipants, 
    socketConnections: socketConnections
};