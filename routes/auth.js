
const express = require('express');
// const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const keys = require('../keys');
const UserModel = require('../models/users');

var router = express.Router();
var passport = require('../config/passportAuth').passport;


router.post('/register', async (req, res) => {

    const username = req.body.username; 
    const password = req.body.password;

    console.log(username); 
    console.log(password);
  
    // for testing
    const payload = {
        userId: 'testUserId',
    };
    const token = jwt.sign(JSON.stringify(payload), 'testSecret');
    // for testing end 

    console.log('testJWT token: ' + token);
    // authentication will take approximately 13 seconds (hashcost = 10)
    // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
    const hashCost = 4;
  
    try {
        const passwordHash = await bcrypt.hash(password, hashCost);  
        console.log('passwordHash: ' + passwordHash);
        const userDocument = new UserModel({ username, passwordHash });
        userDocument.save();
        // await userDocument.save();
        
        res.status(200).send({ username });
      
    } catch (error) {
        res.status(400).send({
            error: 'req body should take the form { username, password }',
        });
    }
  });

router.post('/login', (req, res) => {

    console.log('in login');
    passport.authenticate('local', { session: false },
    function(req, res) {
        // this function called if auth successful
        console.log('auth successful');

        // create payload for JWT
        const payload = {
            username: user.username,
        };

        // assign payload to req.user 
        req.login(payload, {session: false}, (error) => {
            if (error) {
                res.status(400).send({ error });
            }

            // generate signed JWT 
            const token = jwt.sign(JSON.stringify(payload), 'testSecret');
            //   const token = jwt.sign(JSON.stringify(payload), keys.secret);
            console.log('signed JWT token: ' + token);

            // assign JWT to cookie 
            res.cookie('jwt', token, { httpOnly: true, secure: true });
            console.log('hereA');
            res.status(200).send({ username });

            // TODO: store jti

            // res.redirect('/users/' + req.user.username);
        })
    });
    console.log('done');
    res.status(401).send({error : '401 unaurthorized'});
});

// router.post('/login', (req, res) => {

//     console.log('in login');
//     passport.authenticate(
//         'local',
//         { session: false },
//         (error, user) => {
//             console.log('here');
//             if (error || !user) {
//             res.status(400).json({ error });
//             }
    
//             // create payload for JWT
//             const payload = {
//             username: user.username,
//             };
    
//             // assign payload to req.user 
//             req.login(payload, {session: false}, (error) => {
//             if (error) {
//                 res.status(400).send({ error });
//             }
    
//             // generate signed JWT 
//             const token = jwt.sign(JSON.stringify(payload), 'testSecret');
//             //   const token = jwt.sign(JSON.stringify(payload), keys.secret);
//             console.log('signed JWT token: ' + token);
    
//             // assign JWT to cookie 
//             res.cookie('jwt', token, { httpOnly: true, secure: true });
//             console.log('hereA');
//             res.status(200).send({ username });
//             });
//         },
//     )(req, res);
//   });
  
  module.exports = router;