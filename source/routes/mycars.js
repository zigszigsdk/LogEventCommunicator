'use strict'

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

function isNullOrUndefined(x)
{
	return x === null || typeof x === 'undefined';
}

router.get('/mycarmodel', function(req, res)
{
	if(isNullOrUndefined(res.viewData.username))
		return res.sendStatus(401)

	const db = new sqlite3.Database('databases/database.sqlite3');

	db.get("SELECT cars FROM users WHERE username=?"
		,	[res.viewData.username]
		,	function(error, result)
			{
				res.send(result.cars);
			}
	);
});

router.get('/', function (req, res)
{
	if(isNullOrUndefined(res.viewData.username))
		return res.redirect('/');

	res.viewData.earlyScripts =
		[ "https://unpkg.com/react@15/dist/react.js"
		, "https://unpkg.com/react-dom@15/dist/react-dom.js"
		, "https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"
		];
	res.viewData.lateScripts = ["/public/js/mycars.js"];

    res.render('mycars', res.viewData);
});


router.post('/', function (req, res)
{
	if(isNullOrUndefined(res.viewData.username))
		return res.sendStatus(401);

	const db = new sqlite3.Database('databases/database.sqlite3');
	db.run("UPDATE users SET cars=? WHERE username=?"
	,	[req.body.cars, res.viewData.username]
	,	function(error, result)
		{
			function response()
			{
				res.sendStatus(200);
			}

			//response is otherwise too faster to see for demo purposes.
			setTimeout(response, 500); //miliseconds
		}
	);
});

module.exports = router;