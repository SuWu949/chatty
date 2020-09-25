
# Overview

Chatty is a [pub/sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) system built as a companion to supplement traditional web app servers. While existing pub/sub solutions are user-driven, requiring user directives to trigger subscribe/unsubscribe funcationality, chatty is designed to be programmatically controlled by the app server. Built with [Node.js](https://github.com/nodejs), [Express.js](https://github.com/expressjs/express), [Socket.io](https://github.com/socketio/socket.io), and [Passport.js](http://www.passportjs.org/) for [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) authentication of web sockets, and adhering to the [json:api](https://jsonapi.org/) specification, the aim is to provide an efficient and configurable solution made by and for developers to build upon for their product specific use cases. This pub/sub system is ideal for real time updating or serving as the basis of other functionality, such as in a chat application. 

# Getting Started
To start the chat server on default port 3000:

```
$ bin/www
```

To start the chat server locally on port 9999:
```
$ PORT=9999 bin/www
```

# Configuration 
Create a [.env](https://www.npmjs.com/package/dotenv) file in the root directory specifying environment variables. E.g.:
	
	DEV_APP_PORT = 9999 (default is 3000)
	DEV_JWT_SECRET = [your jwt secret key] 		(*)
	DEV_MAX_REQ_SIZE = 50mb 			// Max http request size (*)
	
	* required
	
Refer to `config.js` for declared environment variables. Currently set up for `test` and `development` (default) environments.

# Authentication
Configured Passport.js [passport-jwt](http://www.passportjs.org/packages/passport-jwt/) and [passport-local](http://www.passportjs.org/packages/passport-local/) strategies. 

`passport-local` configured to authenticate previously reqistered users through the `auth/register` endopint with a `username` and `password`. Password encrypted using [bcrypt](https://www.npmjs.com/package/bcrypt). Optionally add a user model and database in `models/users.js`. Upon successful log in of a`passport-local` authenticated endpoint, a JWT generated using the configured JWT secret is returned as a cookie. 


`passport-jwt` configured to authenticate based on the provided JWT and the configured JWT secret. JWT required in the `authorization` header as a bearer token of the socket connection request for a successful socket connection. Example found in `index.pug`.  

Optionally require jwt (‘passport-jwt’) or user log in (‘passport-local’) authentication at endpoints using passport.authenticate(‘[insert configured passport strategy name]’, {}). Example at GET auth/test-jwt.

# Usage

## Notify
Pass the socket event to emit in the POST body. Must contain an ‘event’ and ‘attributes’ property. E.g.:
	
	{ “event”: "chat-message", 
	 “attributes” : {
			 "content": "Hi, how are you?", 
			 "time-sent": 2004-09-16T00:00:00Z, 
			 "sender": "user-1"
          		}
        }

### POST ‘control/notify’ 
Emit socket event defined in request body.

Query parameters
- (Required) `method` = channels:[channel-1, channel-2,...] || channels-efficient:[channel-1, channel-2,...] || users:[userId-1, userId-2,...] 
	1.`channels`: emit event to all subscribers of specified channels, duplicate event receipts allowed
        2. `channels-efficient`: emit event to all subscribers of specified channels, subscribers in more than one channel will only receive one event
        3. `users`: emit event to all users specified
- (Optional) `add` = origin
        1. `origin`: add the name of the message origin channel as property ‘origin’ to the emitted socket event

## Subscription 
POST body required to adhere to [json:api](https://jsonapi.org/). Channels programmatically generated to be named as “[type]-[id]” of the primary data and all related data. 

### POST ‘control/subscription/subscribe’
Subscribe to channel(s) defined by primary and related data in JSON:api object passed in body. 

Query parameters
- (Required) `method` = channels:[channel-1, channel-2,...] || users:[userId-1, userId-2,...]  
        1. `channels`: subscribe all users subscribed to channels specified in query to channels parsed from body
        2. `users`: subscribe users to channels parsed from body 

### POST ‘control/subscription/unsubscribe’
Unsubscribe from channel(s) defined by primary and related data in JSON:api object passed in body. 

Query parameters: 
- (Required) `method` = channels:[channel-1, channel-2,...]  || users:[userId-1, userId-2,...]  
        1. `channels`: unsubscribe all users subscribed to channels specified in query from channels parsed from body
        2. `users`: unsubscribe users from channels parsed from body

## Search 
### GET ‘control/search/subscriptions’
Retrieve an array of channels the specified user is currently subscribed to.

Query parameters: 
- (Required)`userId` = [userId]

### GET ‘control/search/participants’ 
Retrieve an array of user Ids whose sockets are currently subscribed to the specified channel

Query parameters: 
- (Required) `channel`=[channel-name]

## Auth 
### GET ‘/auth/test-jwt’
JWT authenticated endpoint for testing ‘passport-jwt’ strategy.
- A valid JWT must be passed as a bearer token in the `authorization` header for success. 

### PUT ‘/auth/update-jwt-secret’
Update the secret used for ‘passport-jwt’ authentication.
- Require json body with `secret` property

### POST ‘/auth/register’
Register a new user  
- Require body with ‘username’ and ‘password’ properties

### POST ‘/auth/login’
Log in with a user, must have been registered. Once authenticated with ‘passport-local’ strategy, a jwt is returned as a cookie
- Require body with ‘username’ and ‘password’

## Future Work 
1. Build in socket disconnection resilience: store user id/username to subscription mapping - currently storing the userId to socketId mapping and Socket.io would take care of remembering subscriptions associated with sockets, hence once a socket is disconnected, the subscription information is lost
2.  Add additional options functionality to control endpoints: For example, ‘add:date-time’ option to the notify endpoint which adds the date and time as ‘date-time’ to the emitted socket event
3. Create endpoint to query all (connected) users 
4. Flesh out ‘passport-local’ configuration (for admin access), possibly add a user model and database 

## License

	Copyright 2020 Susan Wu

	Licensed under the Apache License, Version 2.0 (the "License"); you may not 
	use this file except in compliance with the License. You may obtain a copy
	of the License at

    		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	License for the specific language governing permissions and limitations
	under the License.

