/*
 * Passport.js authentication entry routes
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
var users = require('../models/users').users;
var router = express.Router();
var passportAuth = require('../config/passportAuth');
var passport = passportAuth.passport;

// Api endpoint to test 'passport-jwt' strategy authentication
router.get('/test-jwt', passport.authenticate('jwt', { session: false }),
function(req, res) {''
    var jwt = req.header('authorization');
    console.log('jwt:' + jwt);
    res.status(200).send({ msg: 'Authenticated with jwt'});
});

// TODO: Require authentication on route
// Update jwt secret used for 'passport-jwt' strategy
router.put('/update-jwt-secret', (req, res) => {

    const newSecret = req.body.secret;  //TODO: error check that new secret is provided
    config.auth.jwtSecret = newSecret; 

    passportAuth.reconfigure();
    // TODO: error codes

    res.status(200).send({ msg: 'Updated jwt secret' });
});

// Register a new user with 'passport-local' strategy
router.post('/register', async (req, res) => {

    const newUsername = req.body.username;          //TODO: error check require
    const newPassword = req.body.password;

    // Time required for authentication using bcrypt
    // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
    const hashCost = 4;
  
    try {
        const newPasswordHash = await bcrypt.hash(newPassword, hashCost);  

        if (newUsername in users) {
            res.status(400).send({ error: 'user already exists' });
        }

        /*
         * Optional use of user database (Ex MongoDB with mongoose) create new user
         * const userDocument = new UserModel({ username: newUsername, passwordHash : newPasswordHash });
         * await userDocument.save();
         *
         * userDocument.save(function(err, doc) {
         *     if (err) return console.error(err);
         *     console.log('User ' + doc.username + ' successfully saved.');
         * });
         */

        users[newUsername] = newPasswordHash;
        res.status(200).send({newUsername});
      
    } catch (error) {
        res.status(400).send({
            error: 'req body should take the form { username, password }',
        });
    }
  });

// Login with user document, create jwt upon success
router.post('/login', 
    passport.authenticate('local', { session: false }),
    function(req, res) {

        console.log('Log in successful with user: ' + req.user);

        // Create jwt payload
        const payload = {
            username: req.user,
        };

        req.login(payload, {session: false}, (error) => {
            if (error) {
                res.status(400).send({ error });
            }

            // Generate signed JWT
            const token = jwt.sign(JSON.stringify(payload), config.auth.jwtSecret);   

            // Assign JWT to cookie
            res.cookie('jwt', token, { httpOnly: true, secure: true });
            res.status(200).send({ msg: 'Logged in' });

            // TODO: Store jti to implement jwt revocation strategy
            // TODO: Redirect authenticated user
        });
    });
  
  module.exports = router;