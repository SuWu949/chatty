const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UserModel = require('./models/users');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  }, async (username, password, done) => {
    try {
      const userDocument = await UserModel.findOne({username: username}).exec();
      const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

      if (passwordsMatch) {
        return done(null, userDocument);
      } else {
        return done('Incorrect Username / Password');
      }
    } catch (error) {
      done(error);
    }
}));




// passport-jwt strategy 


module.exports.authorize = (options, verify) => {
  const strategy = new JwtStrategy(options, verify)

  return function authorize (socket, accept) {
    
    // strategy augmentation
    strategy.success = function success (user) {
      socket.handshake.user = user;
      console.log('success');
      accept();
    }

    strategy.fail = function fail (info) {
      console.log('fail');
      accept(new Error(info));
    }

    strategy.error = function error (err) {
      console.log('error');
      accept(err);
    } 
    
    // passport auth
    strategy.authenticate(socket.request, {});
  }
}

// set passport-jwt options
module.exports.options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),     // jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),   
    secretOrKey: 'testSecret'                                           // query app server endpoint for secre 
}


module.exports.verify = (jwtPayload, done) => { 
    // token is valid 
    // we still can verify the token

    // the user passed is set to socket.request.user
    done(null, user);
}
  
