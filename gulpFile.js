'use strict';

var browserify = require('browserify');
var watchify = require('watchify');

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var karma = require('karma').server;
var source = require('vinyl-source-stream');

function bundle(done) {
    var bundler, rebundle;

    bundler = browserify('./lib/main.js', {
        basedir: __dirname,
        debug: false,
        cache: {}, // required for watchify
        packageCache: {}, // required for watchify
        fullPaths: false // required to be true only for watchify
    });

    rebundle = function (done) {
        var stream = bundler.bundle();
        stream.on('error', function (error) {
            console.error(error);
        });
        stream = stream.pipe(source('eventDrops.js'));
        try {
            stream.pipe(streamify(uglify()));

            stream.pipe(gulp.dest('./src/'));
        } catch (e) {
            if (done) {
                return done(e);
            }

        }
        if(done) {
            stream.on('end', done);
        }
    };

    bundler.on('update', rebundle);

    return rebundle(done);
}

gulp.task('browserify', function (done) {
    return bundle(done);
});

gulp.task('watch', function () {
    return gulp.watch('./lib/*.*', ['browserify']);
});

gulp.task('mocha-test', function () {
    return gulp.src('./test/mocha/*.js', {read: true})
        .pipe(mocha({
            reporter: 'dot',
            ui: 'bdd',
        }));
});

gulp.task('karma-test', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('test', ['mocha-test', 'karma-test']);
