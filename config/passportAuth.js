const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const UserModel = require('../models/users');		// mongoose
const users = require('../models/users').users;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var socketConnections = {}; 				// mapping of user ids to socket objs


passport.use(new LocalStrategy( 
	function (username, password, done) {

		console.log('in local strategy config');
		try {

			// mongoose --- 
			// const userDocument = await UserModel.findOne({username: username}).exec();
			// const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);
			// const userDocument = UserModel.findOne({username: username}).exec();

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


// passport-jwt strategy ----------------

// set passport-jwt options
var options =  {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),     
	secretOrKey: 'testSecret'                                           // query app server endpoint for secre 
}

// define callback
function verify(jwtPayload, done) { 
	// token is valid 
	// we can still additionally verify the token (based on payload)
	// the user passed is set to socket.request.user (jwtPayload?)

	// console.log('jwtPayload: ');
	// console.log(JSON.stringify(jwtPayload, null, 2));

	done(null, jwtPayload);     //authenticated payload
}

//  config jwt strategy 
module.exports.authorize = () => {
  	const jwtStrategy = new JwtStrategy(options, verify);
  
  	return function authorize (socket, next) {
		// console.log('socket.handshake: ');
		// console.log(JSON.stringify(socket.handshake, null, 2));

		const header = socket.handshake.headers['authorization'];
		console.log('header: ' + header);

		// augment jwt strategy 
		jwtStrategy.success = function success (jwtPayload) {
			// jwtPayload parameter from done() call in verify callback 

			// create user property 
			console.log('socket.id: ' + socket.id);
			socket.handshake.user = jwtPayload.username;

			// log user id socket connection
			socketConnections[jwtPayload.username] = socket;
			
			// debug print dictionary
			// console.log('socketConnectiions: ');
			// console.log(socketConnections);

			console.log('Authenticated socket for user: ' + jwtPayload.username);
			next();
		}

		jwtStrategy.fail = function fail (info) {
			console.log('fail. info: ' + info);
			next(new Error(info));
		}

		jwtStrategy.error = function error (err) {
			console.log('error. err: ' + err);
			next(err);
		} 
		
		// authenticate with passport
		jwtStrategy.authenticate(socket.request, {});
  }
}

module.exports.passport = passport;
module.exports.socketConnections = socketConnections; 
