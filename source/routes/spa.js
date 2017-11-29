'use strict'

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

function isValidJson(candidate)
{
	try
	{
		JSON.parse(candidate);
	}
	catch (e)
	{
		return false;
	}
	return true;
}

function isNullOrUndefined(x)
{
	return x === null || typeof x === 'undefined';
}

router.get('/', function (req, res)
{
	if(isNullOrUndefined(req.session.username))
		return res.redirect('/');

	res.viewData.css = ["/public/css/spa.css"];
 	res.viewData.lateScripts = ["/public/js/SPA/main.js"];
	res.viewData.layout = 'spa';
	res.render('spa', res.viewData);
});

/*

router.get('/getData', function(req, res)
{
	if(isNullOrUndefined(req.session.username))
		return res.sendStatus(401);

	const db = new sqlite3.Database('databases/database.sqlite3');

	db.get("SELECT cars FROM users WHERE username=?"
		,	[res.viewData.username]
		,	function(error, result)
			{
				res.send(result.cars);
			}
	);
});

router.post('/', function (req, res)
{
	if(isNullOrUndefined(req.session.username))
		return res.sendStatus(401);

	if(!isValidJson(req.body.cars))
		return res.sendStatus(400);

	const db = new sqlite3.Database('databases/database.sqlite3');

	db.run("UPDATE users SET cars=? WHERE username=?"
	,	[req.body.cars, req.session.username]
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
*/

module.exports = router;