'use strict';

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.get('/', function (req, res)
{
	res.render('login', res.viewData);
});

router.post('/', function (req, res)
{
	if(req.body.username.length === 0)
	{
		res.viewData.serverMessages.push("invalid username");
		return res.render('login', res.viewData);
	}

	if(req.body.password.length === 0)
	{
		res.viewData.serverMessages.push("invalid password");
		return res.render('login', res.viewData);
	}

	const db = new sqlite3.Database('databases/database.sqlite3');
	db.get("SELECT COUNT(*) AS count FROM users where username=? AND password=?;"
		,	[req.body.username, req.body.password]
		,	function(error, result)
			{
				if(result.count === 0)
				{
					res.viewData.serverMessages.push("incorrect username or password");
					return res.render('login', res.viewData);
				}

				req.session.username = req.body.username;
				res.viewData.username = req.body.username;

				req.session.serverMessages.push("successfully logged in");
				res.redirect('/');
			}
		);
});

module.exports = router;