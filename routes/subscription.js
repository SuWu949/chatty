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
        res.status(400).json({msg : 'Query parameter \'q\' required.'});
        return;
    } else if (!query.q.includes(':')) {
        res.status(400).json({msg : 'Query parameter improperly formatted.'});
        return;
    }

    var queryArr = query.q.split(':');
    var flag = queryArr.shift();

    if (flag === 'channels') { 

        var channels = queryArr[0].split(',');
        var newChannels = parseChannels(req);

        socketApi.subscribeByChannel(channels, newChannels);        // TODO: error check
        res.status(200).json({msg : 'Subscribed'});                 // TODO: more info
        
    } else if (flag === 'users') {

        var userIds = queryArr[0].split(',');
        var newChannels = parseChannels(req);

        socketApi.subscribeByUser(userIds, newChannels);            // TODO: error check
        res.status(200).json({msg : 'Subscribed'});                 // TODO: more info
    
    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter \'q\' flag.'});
    }
});
  
// Unsubscribe user(s) from channels in json api body object
router.post('/unsubscribe', function(req, res, next) {
    var query = req.query.q; 
    var queryArr = query.split(':');
    var flag = queryArr.shift();

    var oldChannels = parseChannels(req);

    if (flag === 'users') {

        var userIds = queryArr[0].split(',');

        socketApi.unsubscribeByUser(userIds, oldChannels);         // TODO: error check
        res.status(200).json({msg : 'Unsubscribed'});           // TODO: more info
    
    } else if (flag === 'channels') {
        var channels = queryArr[0].split(',');

        socketApi.unsubscribeByChannel(channels);               // TODO: error check
        res.status(200).json({msg : 'Unsubscribed'});           // TODO: more info

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'})
    }
});

module.exports = router;