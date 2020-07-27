var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// return array of new channels to subscribe to from request body
function parseChannels(req) {
    var newChannels = [];
    var data = req.body.data;
    var newChannels = []; 
    for (var i = 0; i < data.length; i++) {
        var entry = data[i]; 

        newChannels.push(entry.attributes.channel);
        console.log(entry.attributes.channel);
    }
    return newChannels;
};

// subscribe to channels in request body
router.post('/subscribe', function(req, res, next) {

    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    if (flag === 'channels') { 

        // subscribe all users in query parameter channels 
        var channels = queryArr[0].split(',');
        var newChannels = parseChannels(req);

        socketApi.subscribeByChannel(channels, newChannels);
        res.status(200).json({msg : 'Subscribed'});
        
    } else if (flag === 'users') {

        // subscribe users by id

        var userIds = queryArr[0].split(',');
        var newChannels = parseChannels(req);

        socketApi.subscribeByUser(userIds, newChannels);
        res.status(200).json({msg : 'Subscribed'});
    
    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'});
    }
});
  
// unsubscribe a user from a channel
router.post('/unsubscribe', function(req, res, next) {
    
    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    if (flag === 'users') {

        // unsubscribe 'userIds' from 'channels'
        var userIds = queryArr[0].split(',');
        var channels = parseChannels(req);

        socketApi.unsubscribeByUser(userIds, channels);
        res.status(200).json({msg : 'Unsubscribed'});
    
    } else if (flag === 'channels') {
        
        // unsubscribe all users from channels in 'channels'
        var channels = queryArr[0].split(',');

        socketApi.unsubscribeByChannel(channels);
        res.status(200).json({msg : 'Unsubscribed'});

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'})
    }
    
});

module.exports = router;
  