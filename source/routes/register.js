'use strict';

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const uuidV1 = require('uuid/v1');

router.get('/', function(req, res, next)
{
	res.render('register', res.viewData);
});

router.get('verificationCode', function(req, res, next)
{
	console.log()
	res.render('register', res.viewData);
});

router.post('/', function (req, res)
{
	const db = new sqlite3.Database('databases/database.sqlite3');

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

module.exports = router;