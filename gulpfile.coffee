###
this file will generate gulp code to compile this project
###
gulp			= require 'gulp'
gutil			= require 'gulp-util'
# minify			= require 'gulp-minify'
include			= require "gulp-include"
# rename			= require "gulp-rename"
coffeescript	= require 'gulp-coffeescript'
pug				= require 'gulp-pug'
#polyfiller 		= require 'gulp-polyfiller'
# babel			= require 'gulp-babel'

### compile for node ###
gulp.task 'compile-browser', () ->
	console.log '-- compile ajax'
	gulp.src 'assets/browser-ajax.coffee'
		.pipe include
			hardFail: true
		.pipe gulp.dest '../brighter-ui/assets/coffee/imports/'
		# .pipe gulp.dest '../js-lib/assets/imports/'
		.pipe coffeescript(bare: true).on 'error', gutil.log
		.pipe gulp.dest 'dest/'
		#TODO add other dists
		.on 'error', gutil.log

# compile documentation
gulp.task 'compile-doc', () =>
	gulp.src 'doc-src/**/[!_]*.pug'
		.pipe pug locals:{}
		.pipe gulp.dest "doc-dist/"
		.on 'error', gutil.log

### compile ###
gulp.task 'default', ['compile-browser'], () ->
	gulp.watch 'assets/**/*.coffee', ['compile-browser']
	return