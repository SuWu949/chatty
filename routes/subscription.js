var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');


// return array of new channels to subscribe to from request body
function parseNewChannels(req) {
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

// subscribe all users subscribed to specified channels to new channels without userId 
router.post('/subscribe', function(req, res, next) {

    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    if (flag === 'channels') { 

        var channels = queryArr[0].split(',');
        var newChannels = parseNewChannels(req);

        socketApi.subscribeByChannel(channels, newChannels);
        res.status(200).json({msg : 'Subscribed'});

    } else if (flag === 'users') {

        var userIds = queryArr[0].split(',');

        var newChannels = parseNewChannels(req);

        socketApi.subscribeByUser(userIds, newChannels);
        res.status(200).json({msg : 'Subscribed'});
    
    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'})
    }
});
  
// unsubscribe a user from a channel
router.put('/unsubscribe', function(req, res, next) {
    var userId = req.query.userId; 
    var channel = req.query.channel; 

    socketApi.unsubscribe(userId, channel); 
    res.send("Unsubscribed");
});


module.exports = router;
  