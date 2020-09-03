var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// TODO: more general event parsing, may not need
function parseEvent(req) { 
    console.log('in parseMsg');

    var eventParams = []; 
    var event = req.body.event;

    eventParams.push(event);
    var params = req.body.attributes;

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
    
            console.log(key + " -> " + params[key]);
            eventParams.push(params[key]);
        }
    }

    return eventParams;
}

router.post('/', function(req, res, next) {

    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    if (flag === 'channels') {
        var channels = queryArr[0].split(',');
        var eventName = req.body.event;
        var eventParams = req.body.attributes; 

        socketApi.notifyChannels(channels, eventName, eventParams);
        res.status(200).json({msg : 'Notified'});

    } else if (flag == 'users') { 
        var userIds = queryArr[0].split(',');
        var eventName = req.body.event; 
        var eventParams = req.body.attributes;

        // console.log('userIds: ' + userIds);
        // console.log('eventName: ' + eventName);
        // console.log('eventParams: ' + JSON.stringify(eventParams));

        socketApi.notifyUsers(userIds, eventName, eventParams);
        res.status(200).json({msg : 'Notified'});

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'});
    }

});

module.exports = router;