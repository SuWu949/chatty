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

// control/notify
// parameters:
// method = channels/channels-efficient/users
// add = origin/
router.post('/', function(req, res, next) {

    console.log('req.query: ' + JSON.stringify(req.query));

    var query = req.query;

    if ((query == null)) {
        res.status(400).json({msg : 'query parameter method required.'});
        return;
    } else if (!query.method.includes(':')) {
        res.status(400).json({msg : 'query parameter improperly formatted.'});
        return;
    }

    var methodArr = query.method.split(':');

    // remove element at index 0
    var flag = methodArr.shift();

    // Parse body TODO: error check
    var eventName = req.body.event;
    var eventParams = req.body.attributes;

    if (flag === 'channels') {
        var channels = methodArr[0].split(',');

        socketApi.notifyChannels(channels, eventName, eventParams, false);
        res.status(200).json({msg : 'Notified'}); // TODO: error check

    } else if (flag == 'channels-efficient') {

        var channels = methodArr[0].split(',');

        socketApi.notifyChannels(channels, eventName, eventParams, true);
        res.status(200).json({msg : 'Notified'}); // TODO: error check

    } else if (flag == 'users') {
        var userIds = methodArr[0].split(',');

        socketApi.notifyUsers(userIds, eventName, eventParams);
        res.status(200).json({msg : 'Notified'}); // TODO: error check

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'});
    }
});

module.exports = router;