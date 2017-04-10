var gulp = require('gulp');
var nodemon;
nodemon = require('gulp-nodemon');

var toWatch = ['app/**/*.*'];

gulp.task('inject', function() {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./app/frontend/js/**/*.js', './app/frontend/components/**/*.js', './app/frontend/css/**/*.css'], {
        read: false
    });

    var injectOptions = {
        ignorePath: '/app/frontend/'
    };

    var options = {
        bowerJson : require('./bower.json'),
        directory : './app/frontend/bower_components',
        ignorePath: ''
    };

    return gulp.src('./app/frontend/index.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./app/frontend'))
});

gulp.task('start', ['inject'], function () {
    var options = {
        script: 'app/index.js',
        delayTime: 1,
        watch: toWatch
    };

    return nodemon(options)
        .on('restart', function (ev) {
            console.log('Restarting.....')
        });
});