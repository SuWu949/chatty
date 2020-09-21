/*
 * Socket.io pub sub library functions
 */

var socket_io = require('socket.io');
var passportAuth = require('./config/passportAuth'); 
const { TooManyRequests } = require('http-errors');

var socketConnections = passportAuth.socketConnections;
var io = socket_io();

// Set middleware to require authentication for each socket connection
io.use(passportAuth.authorize());

// Called when a new socket connection is registered
io.on('connection', function(socket){

    // For use with sample chat application
    // socket.emit('chat message', {msg: 'User connected with socket: ' + socket.id});
    console.log('Socket ' + socket.id + ' connected.');

    socket.on('disconnect', () => {
        console.log('Socket ' + socket.id + ' disconnected');
    });
});

// Subscribe a user socket(s) to channel(s)
var subscribeByUser = (userIds, channels) => {
    try {
        for (var i = 0; i < userIds.length; i++) {

            var userId = userIds[i];

            if (userId in socketConnections) {

                var userSocket = socketConnections[userId];
                userSocket.join(channels);

            } else {
                console.log('User not found.');
            }
        }

        /*
        * Delay required for subscription to be completed
        * setTimeout(() => {
        *                     console.log('Current subscriptions for user id: ' + userId);
        *                     console.log(JSON.stringify(Object.keys(userSocket.rooms)));
        *                 },
        *             1000);
        */
       return true;
    } catch(error) {
        console.log(error);
        return false;
    }
};

// Subscribe all users subscribed to 'channels' to 'newChannels' as well
var subscribeByChannel = (channels, newChannels) => { 
    try {
        for (var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var channelInfo = io.sockets.adapter.rooms[channel];

            // Check that target channel exists
            if (typeof channelInfo !== 'undefined' && channelInfo) {

                // Subscribe all sockets to 'newChannels'
                var userSockets = Object.keys(channelInfo.sockets);
                userSockets.forEach(function(socketId) {
                    var socket = io.sockets.connected[socketId];
                    socket.join(newChannels);
                });
            }
        }
        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
};

// Unsubscribe user(s) from channel(s)
var unsubscribeByUser = (userIds, oldChannels) => {
    try {
        for (var i = 0; i < userIds.length; i++) {
            var userId = userIds[i];
            var userSocket = socketConnections[userId];

            for (var j = 0; j < oldChannels.length; j++) {
                var channel = oldChannels[j];
                userSocket.leave(channel);
            }
        }
        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
};

// Unsubscribe all users from channel(s)
var unsubscribeByChannel = (channels, oldChannels) => {
    try {
        for (var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var channelInfo = io.sockets.adapter.rooms[channel];

            // Check that target channel exists
            if (typeof channelInfo !== 'undefined' && channelInfo) {

                // Unsubscribe all users from 'channels'
                var userSockets = Object.keys(channelInfo.sockets);
                userSockets.forEach(function(socketId) {
                    var socket = io.sockets.connected[socketId];

                    for (var j = 0; j < oldChannels.length; j++) {
                        var oldChannel = oldChannels[j];
                        socket.leave(oldChannel);
                    }
                });
            }
        }

        /*
        * Delay required for subscription to be completed
        * setTimeout(() => {
        *                     console.log('Current subscriptions for user id: ' + userId);
        *                     console.log(JSON.stringify(Object.keys(userSocket.rooms)));
        *                 },
        *             1000);
        */
            return true;
    } catch(error) {
        console.log(error);
        return false;
    }
}

// Emit event to channel(s)
var notifyChannels = (channels, eventName, eventParams, efficient) => {
    try {
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
        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
};

// Emit event to user(s)
var notifyUsers = (userIds, eventName, eventParams) => {
    try {
        for (var i = 0; i < userIds.length; i++) {
            var userId = userIds[i];
            var socket = socketConnections[userId];

            io.to(socket.id).emit(eventName, eventParams);
        }
        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
}

// Retrieve all subscriptions of user
var getSubscriptions = (userId) => {
    try {
        var userSocket = socketConnections[userId];
        const subscriptions = Object.keys(userSocket.rooms);

        subscriptions.shift();
        return subscriptions;
    } catch(error) {
        console.log(error);
        return null;
    }
};

// Retrieve all user(s) subscribed to channel
var getParticipants = (channel) => {
    var channelObject = io.sockets.adapter.rooms[channel];
    if (typeof channelObject != 'undefined') {
        var channelSockets = channelObject.sockets;
        var userIds = [];

        Object.keys(channelSockets).forEach((socketId, index) => {
            var currUserId = Object.keys(socketConnections).find(key => socketConnections[key]['id'] == socketId);
            userIds.push(currUserId);
        });

        return userIds;
    } else {
        return null;
    }
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