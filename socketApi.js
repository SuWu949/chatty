/*
 * Copyright 2020 Susan Wu
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

// Socket.io pub sub library functions

var socket_io = require('socket.io');
var passportAuth = require('./config/passportAuth');
const { TooManyRequests } = require('http-errors');

const userIdsToSocketArrays = {};
const socketIdsToUserIds = {};

var io = socket_io();

// Set middleware to require authentication for each socket connection
io.use(passportAuth.authorize());

// Called when a new socket connection is registered
io.on('connection', function(socket){

    // For use with sample chat application
    // socket.emit('chat message', {msg: 'User connected with socket: ' + socket.id});
    console.log('Socket ' + socket.id + ' connected.');

    // Assume that the `passportAuth` module has assigned the user id from the JWT.
    const userId = socket.userId;
    let sockets = userIdsToSocketArrays[userId];

    if (!sockets) {
        sockets = [];
        userIdsToSocketArrays[userId] = sockets;
    }

    sockets.push(socket);

    // Register the reverse mapping.
    socketIdsToUserIds[socket.id] = userId;

    socket.on('disconnect', () => {
        const socketId = socket.id

        console.log('Socket ' + socketId + ' disconnected');

        const userId = socketIdsToUserIds[socketId];
        let sockets = userIdsToSocketArrays[userId];

        sockets = sockets.filter((userSocket) => socketId !== userSocket.id);

        if (sockets.length > 0) {
            userIdsToSocketArrays[userId] = sockets;
        } else {
            delete userIdsToSocketArrays[userId];
        }

        delete socketIdsToUserIds[socketId];
    });
});

// Subscribe a user socket(s) to channel(s)
var subscribeByUser = (userIds, channels) => {

    try {
        for (var i = 0; i < userIds.length; i++) {

            var userId = userIds[i];
            const sockets = userIdsToSocketArrays[userId];

            if (sockets) {
                sockets.forEach((socket) => socket.join(channels));
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
                    if (typeof socket == 'undefined') {
                        throw 'Socket no longer exists, disconnected.';
                    }
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
            const sockets = userIdsToSocketArrays[userId];

            if (sockets) {
                for (var j = 0; j < oldChannels.length; j++) {
                    var channel = oldChannels[j];
                    sockets.forEach((socket) => socket.leave(channel));
                }
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
var notifyChannels = (channels, eventName, eventParams, efficient, options) => {
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

                if ('add' in options) {
                    if (options['add'] == 'origin') {
                        eventParams["origin"] = currChannel;
                    }
                }
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
            var sockets = userIdsToSocketArrays[userId];

            if (sockets) {
                sockets.forEach((socket) => io.to(socket.id).emit(eventName, eventParams));
            }
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
        const sockets = userIdsToSocketArrays[userId];

        if (sockets) {
            return [
                ...new Set(sockets.reduce((memo, socket) => {
                    const subscriptions = [...socket.rooms];
                    subscriptions.shift();
                    return memo.concat(subscriptions);
                }, []))
            ];
        } else {
            return [];
        }
    } catch(error) {
        console.log(error);
        return null;
    }
};

// Retrieve all user(s) subscribed to channel
var getParticipants = (channel) => {
    var channelSockets = io.sockets.adapter.rooms.get(channel);

    if (channelSockets) {
        return [
            ...new Set([...channelSockets].reduce((memo, socketId) => {
                const userId = socketIdsToUserIds[socketId];

                if (userId) {
                    memo.push(userId);
                }

                return memo;
            }, []))
        ];
    } else {
        return null;
    }
};

module.exports = {
    io,
    subscribeByUser,
    subscribeByChannel,
    unsubscribeByUser,
    unsubscribeByChannel,
    notifyChannels,
    notifyUsers,
    getSubscriptions,
    getParticipants,
    userIdsToSocketArrays,
    socketIdsToUserIds
};
