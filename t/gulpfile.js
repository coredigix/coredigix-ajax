'use strict';

const	gulp			= require('gulp'),
		gutil			= require('gulp-util'),
		minify			= require('gulp-minify'),
		include			= require("gulp-include"),
		rename			= require("gulp-rename"),
		coffeescript	= require('gulp-coffeescript'),
		// polyfiller 		= require('gulp-polyfiller');
		babel			= require('gulp-babel');

gulp.task('browser-compile', () => {
	return gulp.src('assets/browser.coffee')
		.pipe(include({
			// extensions:'coffee',
			hardFail: true
		}))
		.pipe(coffeescript({bare: true}).on('error', gutil.log))
		.pipe(rename('ajax.js'))
		// .pipe(minify())
		.pipe(gulp.dest("dist/"))
		.on('error', console.error);
});

gulp.task('browser', ['browser-compile'], () => {
	return gulp.watch('assets/**/*.coffee', ['browser-compile']);
});