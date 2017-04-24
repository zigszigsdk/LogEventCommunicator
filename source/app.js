'use strict'

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');
const redisSession = require('connect-redis')(session);
const nodemailer = require('nodemailer');

const development = process.env.NODE_ENV !== 'production';
const config = development ? require('./config.dev.json') : require('./config.prod.json');

const app = express();

viewSetup();
middlewarePipeline();
routeRegistration();
errorHandling();

function viewSetup()
{
	let viewsPath = path.join(__dirname, 'views');
	app.set('views', viewsPath);
	app.engine('handlebars', exphbs({
		extname: 'handlebars',
		partialsDir: viewsPath,
		layoutsDir: viewsPath + "/layouts",
		defaultLayout: 'main'
}));
	app.set('view engine', 'handlebars');
}

function middlewarePipeline()
{
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser(config.cookieSecret));

	app.use(require('sanitize').middleware);

	app.use(function(req, res, next)
	{
		res.config = config;
		res.emailTransporter = nodemailer.createTransport(config.emailTransporterOptions);
		next();
	});


	app.use(session({
	  resave: false,
	  saveUninitialized: false,
	  secret: config.cookieSecret,
	  store: new redisSession()
	}));

	app.use(function(req, res, next)
	{
		if(typeof req.session.serverMessages === 'undefined')
			req.session.serverMessages = [];

		res.viewData =
			{	username: req.session.username
			,	serverMessages: req.session.serverMessages
			};

		req.session.serverMessages = [];

		next();
	});

}

function routeRegistration()
{
	app.use("/public", express.static(path.join(__dirname, 'public')));

	const index = require('./routes/index');
	app.use('/', index);
	app.use('/index', index);
	app.use('/home', index);

	const registerConfirm = require('./routes/registerConfirm');
	app.use('/registerConfirm', registerConfirm);

	const register = require('./routes/register');
	app.use('/register', register);

	const login = require('./routes/login');
	app.use('/login', login);

	const logout = require('./routes/logout');
	app.use('/logout', logout);

	const mycars = require('./routes/mycars');
	app.use('/mycars', mycars);

	app.use(function(req, res, next)
	{
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
}

function errorHandling()
{
	app.use(function(err, req, res, next)
	{
	  	res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		const status = err.status || 500;

		console.log("ERROR: (" + status + ") " + err.message + " ");

		res.status(status);
		res.render('error', { error: err });
	});
}

module.exports = app;