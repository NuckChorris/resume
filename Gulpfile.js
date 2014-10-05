// Not Gulp Plugins
var path     = require('path');
var gulp     = require('gulp');
var del      = require('del');
var lazypipe = require('lazypipe');
// Fix Pipes
var plumber = require('gulp-plumber');
// General
var gulpif      = require('gulp-if');
var sourcemaps  = require('gulp-sourcemaps');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var mergeStream = require('merge-stream');
// Watching
var watch      = require('gulp-watch');
var livereload = require('gulp-livereload');
var notify     = require('gulp-notify');
// JS
var esnext    = require('gulp-esnext');
var uglify    = require('gulp-uglify');
var jshint    = require('gulp-jshint');
var defs      = require('gulp-defs');
// CSS
var less         = require('gulp-less');
var minifycss    = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
	openings: ['src/openings/**/*.json'],
	scripts: ['src/js/**/*.js'],
	styles: ['src/css/**/*.less'],
	pages: ['src/**/*.{htm,html}']
};


/**
 * Utility Functions
 */
var indev = (process.env.ENV === 'development');
function vendorTree (tree) {
	var tree = require(tree);
	var trees = [];

	for (var name in tree) {
		if (tree.hasOwnProperty(name)) {
		(function (name, pkg) {
			var rel = function (p) { return path.join('bower_components', name, p); };
			if (pkg.main) {
				trees.push(gulp.src(rel(pkg.main))
					.pipe(rename({basename: name, dirname: ""})));
			}
			if (pkg.more) {
				trees.push(gulp.src(rel(pkg.more))
					.pipe(rename(function (f) {
						f.dirname = path.join(name, f.dirname);
					})));
			}
		})(name, tree[name]);
		}
	}
	return mergeStream.apply(null, trees);
}
function ifdev (fn) {
	return function () {
		return gulpif(indev, fn.apply(null, arguments));
	}
}


/*
 * Pipelines
 */
var es6 = lazypipe()
	.pipe(sourcemaps.init)
	.pipe(esnext)
	.pipe(defs, {disallowUnknownReferences: false})
	.pipe(uglify)
	.pipe(sourcemaps.write);
var hint = lazypipe()
	.pipe(jshint, {debug: indev, devel: indev})
	.pipe(jshint.reporter, 'jshint-stylish');
var reload = lazypipe()
	.pipe(ifdev(notify))
	.pipe(ifdev(livereload));

/**
 * Tasks
 */
gulp.task('clean', function(cb) {
	del(['build'], cb);
});

gulp.task('scripts', function () {
	return gulp.src(paths.scripts)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.scripts, {name: 'scripts'}))
		.pipe(ifdev(hint)())
		.pipe(es6())
		.pipe(gulp.dest('build/js'))
		.pipe(reload());
});

gulp.task('vendor', function () {
	return vendorTree('./vendor.json')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js/vendor'));
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.styles, {name: 'styles'}))
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(minifycss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/css'))
		.pipe(reload());
});

gulp.task('openings', function () {
	return gulp.src(paths.openings)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.styles, {name: 'openings'}))
		.pipe(gulp.dest('build/openings'))
		.pipe(reload());
});

gulp.task('pages', function () {
	return gulp.src(paths.pages)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.pages, {name: 'pages'}))
		.pipe(gulp.dest('build'))
		.pipe(reload())
});

gulp.task('default', ['scripts', 'vendor', 'pages', 'styles', 'openings']);
