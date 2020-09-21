/*
 * Router for notify endpoints
 */

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');
const e = require('express');

// Send control message in body
router.post('/', function(req, res, next) {

    var query = req.query;

    if ((query == null)) {
        res.status(400).json({msg: 'Query parameter \'method\' required.'});
        return;
    } else if (!query.method.includes(':')) {
        res.status(400).json({msg: 'Query parameter \'method\' improperly formatted.'});
        return;
    }

    var methodArr = query.method.split(':');
    var flag = methodArr.shift();

    if ((req.body.event == null) || (req.body.attributes == null)) {
        res.status(400).json({msg: 'Properties \'event\' and \'attributes\' required.'});
    }

    var eventName = req.body.event;
    var eventParams = req.body.attributes;

    if (flag === 'channels') {
        var channels = methodArr[0].split(',');

        if (socketApi.notifyChannels(channels, eventName, eventParams, false)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else if (flag == 'channels-efficient') {

        var channels = methodArr[0].split(',');

        if (socketApi.notifyChannels(channels, eventName, eventParams, true)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else if (flag == 'users') {
        var userIds = methodArr[0].split(',');

        if (socketApi.notifyUsers(userIds, eventName, eventParams)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else {
        res.status(400).json({msg : methodArr[0] + ' is not a valid \'method\' query parameter option.'});
    }
});

module.exports = router;