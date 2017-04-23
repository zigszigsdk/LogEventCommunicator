'use strict'

var express = require('express');
var router = express.Router();

router.get('/', function (req, res)
{
	delete req.session.username;
    req.session.serverMessages.push("successfully logged out");
    res.redirect('/');
});

module.exports = router;