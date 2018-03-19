'use strict';

var gulp	= require('gulp');
var minify	= require('gulp-minify');
var include	= require("gulp-include");
var rename	= require("gulp-rename");
var concat	= require('gulp-concat');

// gulp.task('js', () => {
// 	gulp.src('assets/*.js')
// 		.pipe(include({
// 			hardFail: true
// 		}))
// 		.pipe(rename('index.js'))
// 		.pipe(minify())
// 		.pipe(gulp.dest("dist/"));
// });

gulp.task('js', function() {
  return gulp.src('assets/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/'));
});