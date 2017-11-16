const extensionsToCopy = [".js", ".json", ".handlebars"];

const tsEntrypoints = 	
	[ ['helloworld','/source/public/js/helloworld.tsx']
	];

const tsOutputDir ='/build/public/js/';

//--------------------------------------------------------------------------------

const gulp = require('gulp');
const react = require('gulp-react');
const del = require('del')
const merge = require('merge2');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const tsPipeline = require('gulp-webpack-typescript-pipeline');

const buildLocation = __dirname + "/build/";
const anyFile = 'source/**/*'
const anyJsx = anyFile + '.jsx';
const anyTs = anyFile + '.ts';
const anyTsx = anyFile + '.tsx';

const tsEntrypointsParsed = {}

for(let index in tsEntrypoints)
	tsEntrypointsParsed[tsEntrypoints[index][0]] = __dirname + tsEntrypoints[index][1];

tsPipeline.registerBuildGulpTasks(
	gulp
,	{	entryPoints: tsEntrypointsParsed
	,	outputDir: __dirname + tsOutputDir
	}
);

const TASK =
	{ CLEAN: 'remove previous build'
	, TS: 'transpile typescript (inc tsx)'
	, JSX: 'transpile react'
	, COPY: 'copying rest'
	, DB: 'manage db'
	, RUN: 'run and watch for changes'
	};

const build = [TASK.CLEAN, TASK.TS, TASK.JSX, TASK.COPY, TASK.DB];
const devRun = [TASK.RUN];

gulp.task('default', build);
gulp.task('build', build);
gulp.task('dev', devRun);


function NOT(exp){ return "!"+exp; }

gulp.task(TASK.CLEAN, function()
{
	return del(['build/**/*']);
});


gulp.task(TASK.TS, [TASK.CLEAN], function ()
{	
	return gulp.start('tsPipeline:build:dev');
});


gulp.task(TASK.JSX, [TASK.CLEAN], function ()
{
	return gulp.src(anyJsx)
		.pipe(react())
		.pipe(gulp.dest(buildLocation));
});

gulp.task(TASK.COPY, [TASK.CLEAN], function()
{
	let files = [];
	for(let index in extensionsToCopy)
		files.push(anyFile + extensionsToCopy[index]);

	return gulp.src(files).pipe(gulp.dest(buildLocation))
});

gulp.task(TASK.DB, [], function()
{
	var dir = './databases';

	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);


	const db = new sqlite3.Database('databases/database.sqlite3');

	db.get("SELECT COUNT(*) AS count FROM sqlite_master where type='table' AND name='users'",
		function(error, result)
		{
			if(result.count === 0)
				db.run("CREATE TABLE users (username TEXT, password TEXT,cars TEXT)");
		});

	db.get("SELECT COUNT(*) AS count FROM sqlite_master where type='table' AND name='unconfirmedUsers'",
		function(error, result)
		{
			if(result.count === 0)
				db.run("CREATE TABLE unconfirmedUsers (username TEXT, password TEXT,verificationCode TEXT)");
		});
});

gulp.task(TASK.RUN, build, function ()
{
	//late require, so that build can be performed without devDependencies
	const nodemon = require('gulp-nodemon');

	const stream = nodemon(
		{ script: buildLocation + 'bin/www.js'
		, tasks: build
		, env: { 'NODE_ENV': 'development' }
		, watch: ["source", "package.json"]
		, ext: 'js jsx ts tsx json handlebars'
		});

	stream
		.on('restart', function () {
			console.log('restarted!');
		})
		.on('crash', function() {
			console.error('Application has crashed!\n');
			stream.emit('restart', 10);//seconds
		});
});
