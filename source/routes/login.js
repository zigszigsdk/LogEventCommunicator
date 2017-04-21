'use strict'

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.get('/', function (req, res) {
    res.render('login', res.viewData);
});
router.post('/', function (req, res)
{
	const db = new sqlite3.Database('databases/database.sqlite3');
	db.get("SELECT COUNT(*) AS count FROM users where username=? AND password=?"
		,	[req.body.username, req.body.password]
		,	function(error, result)
			{
				if(result.count === 0)
				{
					res.viewData.serverMessages.push("incorrect username or password")
					return res.render('login', res.viewData);
				}

				res.cookie("username", req.body.username);
    			res.viewData.username = req.body.username;

				res.viewData.serverMessages.push("successfully logged in");
				res.render('login', res.viewData)
			}
		);
});

module.exports = router;