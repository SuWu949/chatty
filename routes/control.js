var express = require('express');
var router = express.Router();

// /* GET users listing. */
router.get('/', function(req, res, next) {
  // res.io.emit("socketToMe", "users");
  res.send('control route');
}); 




module.exports = router;
