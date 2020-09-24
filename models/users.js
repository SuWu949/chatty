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