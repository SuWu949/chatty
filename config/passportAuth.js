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

// Configuration of Passport.js with the 'passport-local' and 'passport-jwt' strategies
// http://www.passportjs.org/

const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const config = require('./config');
const users = require('../models/users').users;

// Mapping of user ids to socket objects
var socketConnections = {};

/*
 * Configure 'passport-local' strategy
 */

passport.use(new LocalStrategy( 
	function (username, password, done) {

		console.log('in local strategy config');
		try {

			/*
			 * Option for using a user database: ex MongoDB with mongoose
			 * const userDocument = await UserModel.findOne({username: username}).exec();
			 * const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);
			 * const userDocument = UserModel.findOne({username: username}).exec();
			*/

			const userPasswordHash = users[username];
			if (userPasswordHash == null) { 
				return done(null, false, {message: 'User ' + username + ' not found'});  // TODO: pass error message through 401 
			} 

			const passwordsMatch = bcrypt.compare(password, userPasswordHash, function (err, isMatch) {
				if (err) throw err;
				if(isMatch){
					console.log('Correct password');
					return done(null, username, {message: 'Correct password'});
				} else { 
					console.log('Incorrect password');
					return done(null, false, {message: 'Incorrect Username / Password'});
				}
			});
		} catch (error) {
			console.log('catch error: ' + error);
			done(error);
		}
}));

/*
 * Configure 'passport-jwt' strategy for socket connection authentication
 */

var options =  {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),    
	secretOrKey: config.auth.jwtSecret                                         
}

// Callback called when the jwt presented is valid
function verify(jwtPayload, done) { 
	// We can still additionally verify the token (based on payload) here

	console.log('jwtPayload: ');
	console.log(JSON.stringify(jwtPayload, null, 2));

	done(null, jwtPayload);
}

// Intial new jwt strategy instantiation
var jwtStrategy = new JwtStrategy(options, verify); 
passport.use(jwtStrategy);

// Modify jwt strategy with new secret
module.exports.reconfigure = () => { 
	try {
		options.secretOrKey = config.auth.jwtSecret;
		jwtStrategy = new JwtStrategy(options, verify);
		passport.use(jwtStrategy);
		console.log('Updated options secret: ' + options.secretOrKey);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

module.exports.authorize = (socket, next) => {
  	return function authorize (socket, next) {
		const header = socket.handshake.headers['authorization'];
		console.log('header: ' + header);

		// Augment 'passport-jwt' strategy
		jwtStrategy.success = function success (jwtPayload) {
			// 'jwtPayload' passed from success callback 'verify'

			// console.log(socket.handshake);

			// Log new user socket connection
			socketConnections[jwtPayload.sub] = socket;

			console.log('Authenticated socket for user id: ' + jwtPayload.sub);
			next();
		}

		jwtStrategy.fail = function fail (info) {
			console.log('jwt authentication fail: ' + info);  // TODO: return 401 error code
			next(new Error(info));
		}

		jwtStrategy.error = function error (err) {
			console.log('jwt authentication error: ' + err);  // TODO: return error code
			next(err);
		} 
		
		// Authenticate socket connection request with passport
		jwtStrategy.authenticate(socket.request, {});
  }
}

module.exports.passport = passport;
module.exports.socketConnections = socketConnections; 
