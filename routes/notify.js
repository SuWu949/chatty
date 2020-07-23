var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');


// TODO: more general event parsing
function parseMsg(req) { 
    console.log('in parseMsg');
    var event = req.body.event;
    var msg = req.body.attributes.msg;

    return msg;
}

router.post('/', function(req, res, next) {

    console.log('in notify');
    var query = req.query.q; 
    var queryArr = query.split(':');

    // remove element at index 0
    var flag = queryArr.shift();

    console.log('flag: ' + flag);
    if (flag === 'channels') {
        
        var channels = queryArr[0].split(',');
        var msg = parseMsg(req);

        socketApi.notifyChannels(channels, msg);
        res.status(200).json({msg : 'Notified'});

    } else if (flag == 'users') { 

        var userIds = queryArr[0].split(',');
        var msg = parseMsg(req);

        console.log('userIds: ' + userIds);
        console.log('msg: ' + msg);

        socketApi.notifyUsers(userIds, msg);
        res.status(200).json({msg : 'Notified'});

    } else {
        res.status(400).json({msg : queryArr[0] + ' is not a valid query parameter flag.'});
    }

});

module.exports = router;