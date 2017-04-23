'use strict'

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.get('/'
	, function(req, res, next) {
		res.render('register', res.viewData);
	}
);

router.post('/', function (req, res)
{
	const db = new sqlite3.Database('databases/database.sqlite3');

	db.run("INSERT INTO users(username,password,cars) VALUES(?,?,?)"
		, [req.body.username, req.body.password, JSON.stringify({idCounter:0,cars:[]})]
	);

	req.session.serverMessages.push("registration completed");
	res.redirect('/');
});

module.exports = router;