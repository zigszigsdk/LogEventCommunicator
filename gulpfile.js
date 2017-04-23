const gulp = require('gulp');
const react = require('gulp-react');
const del = require('del')
const anyFile = 'source/**/*';
const anyReact = 'source/**/*.jsx';
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const buildLocation = "build/";

const TASK =
	{ CLEAN: 'remove previous build'
	, REACT: 'transpile react'
	, COPY: 'copy other files'
	, DB: 'manage db'
	, RUN: 'run and watch for changes'
	};

const build = [TASK.CLEAN, TASK.REACT, TASK.COPY, TASK.DB];
const devRun = [TASK.RUN];

gulp.task('default', build);
gulp.task('build', build);
gulp.task('dev', devRun);

function NOT(exp){ return "!"+exp; }

gulp.task(TASK.CLEAN, function()
{
	return del(['build/**/*']);
});

gulp.task(TASK.REACT, [TASK.CLEAN], function () {
	return gulp.src(anyReact)
		.pipe(react())
		.pipe(gulp.dest(buildLocation));
});

gulp.task(TASK.COPY, [TASK.CLEAN], function() {
	return gulp.src([anyFile, NOT(anyReact)])
		.pipe(gulp.dest(buildLocation));
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
});

gulp.task(TASK.RUN, build, function ()
{
	//late require, so that build can be performed without devDependencies
	const nodemon = require('gulp-nodemon');

	const stream = nodemon(
		{ script: 'build/bin/www'
		, tasks: build
		, env: { 'NODE_ENV': 'development' }
		, watch: ["source", "package.json"]
		, ext: 'js jsx json handlebars'
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
