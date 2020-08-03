var registeredUsers = {}; 

module.exports.users = registeredUsers; 

// mongoose config below -----------

// const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});		// open connection to local test database

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
// 	  // we're connected!
// 	  console.log('Connected to database.');
// });

// console.log('readyState: ' + db.readyState);

// const userSchema = new mongoose.Schema({
//   username: {
// 	type: String,
// 	index: true,
// 	unique: true,
// 	dropDups: true,
// 	required: true,
//   },

//   passwordHash: {               //salted and hashed using bcrypt
// 	type: String,
// 	required: true,
//   },

//   // jti

// });

// const User = mongoose.model('User', userSchema);
// module.exports = User;