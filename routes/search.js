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

// Router for search endpoints

var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');
const { expressionToConstant } = require('constantinople');

// Get all channel subscriptions by userId
router.get('/subscriptions', function(req, res, next) {
    var userId = req.query.userId;

    if (userId in socketApi.socketConnections) {
      var channels = socketApi.getSubscriptions(userId);
      if (channels != null) {
        res.status(200).send(channels);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(400).json({msg: 'User does not exist.'});
    }
  });

// Get userIds subscribed to channel
router.get('/participants', function(req, res, next) {
    var channel = req.query.channel;
    var users = socketApi.getParticipants(channel);

    if (users != null) {
      res.status(200).send(users);
    } else {
      res.status(400).json({msg: 'Channel does not exist.'});
    }
});

module.exports = router;
