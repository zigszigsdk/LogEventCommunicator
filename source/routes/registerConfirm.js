'use strict';

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

router.get('/', function(req, res, next)
{
	const db = new sqlite3.Database('databases/database.sqlite3');
	db.get("SELECT username,password FROM unconfirmedUsers WHERE verificationCode=?;"
		,	[req.query.verificationCode]
		,	function(error, result)
			{
				if(error)
					return console.log(error);

				if(typeof result === 'undefined')
				{
					res.viewData.serverMessages.push("Invalid confirmation code");
					return res.render('registerConfirm', res.viewData);
				}

				db.run("DELETE FROM unconfirmedUsers WHERE username=?;",[result.username]);

				db.run("INSERT INTO users(username,password,cars) VALUES(?,?,?);"
					,	[result.username, result.password, JSON.stringify({idCounter:0,cars:[]})]);

				res.viewData.serverMessages.push("Validation completed. You may now sign in.");
				return res.render('registerConfirm', res.viewData);
			}
	);
});

module.exports = router;