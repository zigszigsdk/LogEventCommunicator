'use strict'

const express = require('express');
const router = express.Router();

router.get('/', function (req, res)
{
	res.viewData.lateScripts = ["/public/js/helloworld.js"];
	res.render('index', res.viewData);
});

module.exports = router;