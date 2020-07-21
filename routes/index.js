var express = require('express');
var router = express.Router();
var controlRouter = require('./control');
var socketApi = require('../socketApi');

router.use('/control', controlRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.status(200).json({ message: 'Connected!' });
  res.render('index', { title: 'Toy Chat' });
  
});

module.exports = router;
