/*
 * Router for notify endpoints
 */

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');

// Send control message in body
router.post('/', function(req, res, next) {

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

    var eventName = req.body.event;
    var eventParams = req.body.attributes;

    if (flag === 'channels') {
        var channels = methodArr[0].split(',');

        socketApi.notifyChannels(channels, eventName, eventParams, false);
        res.status(200).json({msg : 'Notified'});           // TODO: error check

    } else if (flag == 'channels-efficient') {

        var channels = methodArr[0].split(',');

        socketApi.notifyChannels(channels, eventName, eventParams, true);
        res.status(200).json({msg : 'Notified'});           // TODO: error check

    } else if (flag == 'users') {
        var userIds = methodArr[0].split(',');

        socketApi.notifyUsers(userIds, eventName, eventParams);
        res.status(200).json({msg : 'Notified'});           // TODO: error check

    } else {
        res.status(400).json({msg : methodArr[0] + ' is not a valid \'method\' query parameter option.'});
    }
});

module.exports = router;