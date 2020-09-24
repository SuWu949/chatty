# Overview

A real-time pub sub system that serves as a companion to traditional web app servers built with Node.js, Express.js, Socket.io, and Passport.js. While existing pub sub solutions are user-driven, this solution is designed to be programmatically controlled by the app server. The aim is to provide an efficient and configurable solution made by and for developers to build their products on. One sample use case is as a chat server. 

To provide real-time updating, this project is built using Socket.io websockets. JWT authentication is required to open socket connections.

File startup script initialized with express-generator.

# Getting Started
To start the chat server on default port 3000:
`$ bin/www`

To start the chat server locally on port 9999:
`$ PORT=9999 bin/www`

# Configuration 
Create a .env (https://www.npmjs.com/package/dotenv) file in the root directory specifying environment variables. E.g.:
	`DEV_APP_PORT = 9999 (default is 3000)
	DEV_JWT_SECRET = [your jwt secret key] (required)
	DEV_MAX_REQ_SIZE = 50mb // Max http request size (required)`

Refer to config.js. Currently set up for ‘test’ and ‘development’ (default) environments.

# Authentication
Implemented Passport.js ‘passport-jwt’ and ‘passport-local’ strategies. Currently JWTs are required to open socket connections. Send a bearer token as an ‘authorization’ header with the socket request. Example found in index.pug. 

Optionally require jwt (‘passport-jwt’) or user log in (‘passport-local’) on endpoints using passport.authenticate(‘[insert configured passport strategy name]’, {}). Example at GET auth/test-jwt.

# Usage

## Notify
Pass the socket event to emit in the POST body. Must contain an ‘event’ and ‘attributes’ property. 
{ “event”: [eventName], 
			 “attributes” : {
					[eventAttributes]
          }
                                    }

### POST ‘control/notify’ 
- Emit socket event defined in request body
- Parameters
    - ‘method’ = channels:[channel-1, channel-2,...] || channels-efficient:[channel-1, channel-2,...] || users:[userId-1, userId-2,...] 
        1. channels: emit event to all subscribers of specified channels, duplicate event receipts allowed
        2. channels-efficient: emit event to all subscribers of specified channels, subscribers in more than one channel will only receive one event
        3. users: emit event to all users specified
    - ‘add’ = origin
        1. origin: add the name of the message origin channel as property ‘origin’ to the emitted socket event

## Subscription 
POST body required to adhere to JSON:api. Channels programmatically generated to be names as “[type]-[id]” of the primary data and all related data. 

### POST ‘control/subscription/subscribe’
- Subscribe to channels defined by primary and related data in JSON:api object passed in body 
- Parameters
    - ‘method’ = channels:[channel-1, channel-2,...]  || users:[userId-1, userId-2,...]  
        1. ‘channels’: subscribe all users subscribed to channels specified in query to channels parsed from body
        2. ‘users’: subscribe users to channels parsed from body 

### POST ‘control/subscription/unsubscribe’
- Unsubscribe from channels defined by primary and related data in JSON:api object passed in body 
- Parameters: 
    - ‘method’ = channels:[channel-1, channel-2,...]  || users:[userId-1, userId-2,...]  
        1. ‘channels’: unsubscribe all users subscribed to channels specified in query from channels parsed from body
        2. ‘users’: unsubscribe users from channels parsed from body

## Search 
### GET ‘control/search/subscriptions’
- Retrieve an array of channels the specified user is currently subscripted to
- Parameters: 
    - `userId` = [userId]

### GET ‘control/search/participants’ 
- Retrieve an array of user Ids whose sockets are currently subscribed to the specified channel
- Parameters: 
    - ‘channel’=[channel_name]

## Auth 
### GET ‘/auth/test-jwt’
- JWT authenticated endpoint for testing ‘passport-jwt’ strategy

### PUT ‘/auth/update-jwt-secret’
- Update the secret used for ‘passport-jwt’ authentication
- Require body with ‘secret’ property

### POST ‘/auth/register’
- Register a new user 
- Require body with ‘username’ and ‘password’ properties

### POST ‘/auth/login’
- Log in with a user, must have been registered. Once authenticated with ‘passport-local’ strategy, a jwt is returned as a cookie
- Require body with ‘username’ and ‘password’

## Future Work 
- Build in socket disconnection resilience: store user id/username to subscription mapping - currently storing the userId to socketId mapping and Socket.io would take care of remembering subscriptions associated with sockets, hence once a socket is disconnected, the subscription information is lost
-  Add additional options functionality to control endpoints: For example, ‘add:date-time’ option to notify endpoint - adds the date and time as ‘date-time’ to the emitted socket event
- Create endpoint to query all users 
[Optional] Flesh out ‘passport-local’ configuration (for admin access), possibly add a user model and database 

## License

> Copyright 2020 Susan Wu

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy
of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.

