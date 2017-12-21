var express = require('express');
var router = express.Router();

router.use('/', require('./providers/local'));

module.exports = router;