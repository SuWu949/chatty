var express = require('express');
var router = express.Router();
var controlRouter = require('./control');
var authRouter = require('./auth');

router.use('/control', controlRouter);
router.use('/auth', authRouter);

/* GET home login page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Toy Chat' });
  
});

module.exports = router;
