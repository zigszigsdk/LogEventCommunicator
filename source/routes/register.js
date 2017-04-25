'use strict';

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const uuidV1 = require('uuid/v1');

function isNullOrUndefined(x)
{
	return x === null || typeof x === 'undefined';
}

function isValidEmail(candidate)
{
	//from http://emailregex.com/
    var emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailregex.test(candidate);
}

router.get('/', function(req, res, next)
{
	res.render('register', res.viewData);
});

router.post('/', function (req, res)
{
	if(!isValidEmail(req.body.email))
	{
		res.viewData.serverMessages.push("invalid email address");
		return res.render('register', res.viewData);
	}

	if(req.body.username.length === 0)
	{
		res.viewData.serverMessages.push("invalid username");
		return res.render('register', res.viewData);
	}

	if(req.body.password.length === 0)
	{
		res.viewData.serverMessages.push("invalid password");
		return res.render('register', res.viewData);
	}

	res.viewData.username = req.body.username;
	res.viewData.email = req.body.email;

	const db = new sqlite3.Database('databases/database.sqlite3');

	db.get("SELECT COUNT(*) AS count FROM users WHERE username=?;"
	,	[req.body.username]
	,	function(error, result)
		{
			if(error)
				return console.log(error);

			if(result.count !== 0)
			{
				res.viewData.serverMessages.push("username '" + req.body.username + "' is taken");
				return res.render('register', res.viewData);
			}

			db.get("SELECT COUNT(*) AS count FROM unconfirmedUsers WHERE username=?;"
			,	[req.body.username]
			,	function(error, result)
				{
					if(error)
						return console.log(error);

					if(result.count !== 0)
					{
						res.viewData.serverMessages.push("username '" + req.body.username + "' is taken");
						return res.render('register', res.viewData);
					}

					const verificationCode = uuidV1();

					db.run("INSERT INTO unconfirmedUsers(username,password,verificationCode) VALUES(?,?,?);"
						,	[req.body.username, req.body.password, verificationCode]
						,	function(error, result)
							{
								if (error)
									return console.log(error);

								const mailOptions =
								{	from: '"' + res.config.noreplyEmailDisplay.name +
										'" <' + res.config.noreplyEmailDisplay.address + '>'
								,	to: req.body.email
								,	subject: 'email verification link'
								,	text: 'please visit the following link to verify your Cars Demo account: ' +
									res.config.externalAddress + "registerConfirm?verificationCode=" + verificationCode
								};

								res.emailTransporter.sendMail(mailOptions, function(error, info)
								{
									if (error)
										return console.log(error);

									req.session.serverMessages.push("verification email has been sent. It probably landed in your spam folder.. :) ");
									res.redirect('/');
								});
						});
				});
		});
});

module.exports = router;