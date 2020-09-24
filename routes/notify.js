/*
 * Copyright 2020 Susan Wu
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

// Router for notify endpoints

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
    var rooms = methodArr[0].split(',');

    // Parse additional options
    var options = {};
    if (query.add != null) {
        if (query.add != 'origin') {
            res.status(400).json({msg: query.add + ' is not a valid \'add\' query parameter option.'});
        }
        options['add'] = query.add;
    }

    if (flag === 'channels') {
        if (socketApi.notifyChannels(rooms, eventName, eventParams, false, options)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else if (flag == 'channels-efficient') {
        if (socketApi.notifyChannels(rooms, eventName, eventParams, true, options)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else if (flag == 'users') {
        if (socketApi.notifyUsers(rooms, eventName, eventParams)) {
            res.status(200).json({msg : 'Notified.'});
        } else {
            res.status(500);
        }

    } else {
        res.status(400).json({msg : methodArr[0] + ' is not a valid \'method\' query parameter option.'});
    }
});

module.exports = router;