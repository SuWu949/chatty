/*
 * Router for subscription endpoints
 */

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// Return array of new channels parsed from json api object
function parseChannels(req) {
    var newChannels = [];
    var data = req.body.data;

    if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            var entry = data[i];

            var currChannel = entry.type + '-' + entry.id;
            newChannels.push(currChannel);
        }

    } else {
        var mainChannel = data.type + '-' + data.id;
        newChannels.push(mainChannel);
    }

    if ('included' in req.body) {
        var included = req.body.included;
        for (var i = 0; i < included.length; i++) {
            var entry = included[i];

            var currChannel = entry.type + '-' + entry.id;
            newChannels.push(currChannel);
        }
    }

    return newChannels;
};

// Subscribe user(s) to channels in json api body object, create channels if they don't exist
router.post('/subscribe', function(req, res, next) {
    var query = req.query;

    if ((query == null)) {
        res.status(400).json({msg : 'Query parameter \'method\' required.'});
        return;
    } else if (!query.method.includes(':')) {
        res.status(400).json({msg : 'Query parameter improperly formatted.'});
        return;
    }

    var methodArr = query.method.split(':');
    var flag = methodArr.shift();

    if (flag === 'channels') {
        var channels = methodArr[0].split(',');
        var newChannels = parseChannels(req);

        console.log('newChannels: ' + newChannels);
        if (socketApi.subscribeByChannel(channels, newChannels)) {
            res.status(200).json({msg : 'Subscribed'});
        } else {
            res.status(500);

        }

    } else if (flag === 'users') {
        var userIds = methodArr[0].split(',');
        var newChannels = parseChannels(req);

        if (socketApi.subscribeByUser(userIds, newChannels)) {
            res.status(200).json({msg : 'Subscribed'});
        } else {
            res.status(500);
        }

    } else {
        res.status(400).json({msg : methodArr[0] + ' is not a valid query parameter \'method\' option.'});
    }
});
  
// Unsubscribe user(s) from channels in json api body object
router.post('/unsubscribe', function(req, res, next) {

    var query = req.query;

    if ((query == null)) {
        res.status(400).json({msg : 'Query parameter \'method\' required.'});
        return;
    } else if (!query.method.includes(':')) {
        res.status(400).json({msg : 'Query parameter improperly formatted.'});
        return;
    }

    var methodArr = query.method.split(':');
    var flag = methodArr.shift();

    var oldChannels = parseChannels(req);

    if (flag === 'users') {

        var userIds = methodArr[0].split(',');

        if (socketApi.unsubscribeByUser(userIds, oldChannels)) {
            res.status(200).json({msg : 'Unsubscribed'});
        } else {
            res.status(500);
        }
    
    } else if (flag === 'channels') {
        var channels = methodArr[0].split(',');

        if (socketApi.unsubscribeByChannel(channels)) {
            res.status(200).json({msg : 'Unsubscribed'});
        } else {
            res.status(500);
        }
    } else {
        res.status(400).json({msg : methodArr[0] + ' is not a valid query parameter \'method\' option.'})
    }
});

module.exports = router;