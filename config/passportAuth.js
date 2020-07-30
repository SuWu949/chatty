const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UserModel = require('../models/users');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


passport.use(new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
  }, function (username, password, done) {

	console.log('in local strategy config');
	try {
		// const userDocument = await UserModel.findOne({username: username}).exec();
		// const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);
		const userDocument = UserModel.findOne({username: username}).exec();
		const passwordsMatch = bcrypt.compare(password, userDocument.passwordHash);
		console.log('passwordsMatch: ' + passwordsMatch); 

		if (passwordsMatch) {
			return done(null, userDocument);
		} else {
			return done('Incorrect Username / Password');
		}
	} catch (error) {
	  	done(error);
	}
}));

// set passport-jwt options
var options =  {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),     
	secretOrKey: 'testSecret'                                           // query app server endpoint for secre 
}

function verify(jwtPayload, done) { 
	// token is valid 
	// we can still additionally verify the token (based on payload)

	// the user passed is set to socket.request.user
	console.log('jwtpayload: ');
	console.log(JSON.stringify(jwtPayload, null, 2));

	done(null, jwtPayload);     //authenticated payload
}


// passport-jwt strategy 
module.exports.authorize = () => {
  	const jwtStrategy = new JwtStrategy(options, verify);
  
  	return function authorize (socket, next) {
		console.log(JSON.stringify(socket.handshake, null, 2));

		const header = socket.handshake.headers['authorization'];
		console.log('header: ' + header);

		// augment jwt strategy 
		jwtStrategy.success = function success (jwtPayload) {
			// jwtPayload parameter from done() call in verify callback 

			// create user property 
			console.log('socket.id: ' + socket.id);
			socket.handshake.user = jwtPayload.userId;

			// log user id socket connection
			// socketConnections[jwtPayload.userId] = socket;
			console.log(JSON.stringify(socket.handshake, null, 2));
			console.log('success. user: ' + jwtPayload.userId);
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
