/*
 * Option to create a user database
 * const mongoose = require('mongoose');
 *
 * mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});
 *
 * const db = mongoose.connection;
 * db.on('error', console.error.bind(console, 'connection error:'));
 * db.once('open', function() {
 * 	  // we're connected!
 * 	  console.log('Connected to database.');
 * });
 *
 * console.log('readyState: ' + db.readyState);
 *
 * const userSchema = new mongoose.Schema({
 *   username: {
 * 	type: String,
 * 	index: true,
 * 	unique: true,
 * 	dropDups: true,
 * 	required: true,
 *   },
 *
 *  passwordHash: {               //salted and hashed using bcrypt
 * 	type: String,
 * 	required: true,
 *   },
 * });
 *
 * const User = mongoose.model('User', userSchema);
 * module.exports = User;
 */

var registeredUsers = {};

module.exports.users = registeredUsers;