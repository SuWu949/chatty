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

    console.log('in notify');
    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    console.log('flag: ' + flag);
    if (flag === 'channels') {
        //TODO: generalize for other events, may need to self implement set, avoid eval()
        var channels = queryArr[0].split(',');
        var msg = req.body.attributes.msg;
        // var msg = parseMsg(req);

        socketApi.notifyChannels(channels, msg);
        res.status(200).json({msg : 'Notified'});

    } else if (flag == 'users') { 
        //TODO: client side parse JSON object emit event
        var userIds = queryArr[0].split(',');
        // var eventParams = parseEvent(req);
        var eventName = req.body.event; 
        var eventParams = JSON.stringify(req.body.attributes);
        // var eventParams = req.body.attributes;

        console.log('userIds: ' + userIds);
        console.log('eventParams: ' + eventParams);

        socketApi.notifyUsers(userIds, eventName, eventParams);
        res.status(200).json({msg : 'Notified'});

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'});
    }

});

module.exports = router;