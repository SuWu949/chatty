const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
	type: String,
	index: true,
	unique: true,
	dropDups: true,
	required: true,
  },

  passwordHash: {               //salted and hashed using bcrypt
	type: String,
	required: true,
  },

  // jti

});

const User = mongoose.model('User', userSchema);
module.exports = User;