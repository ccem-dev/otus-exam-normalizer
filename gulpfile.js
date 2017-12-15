(function() {

  var gulp = require('gulp');
  var browserSync = require('browser-sync').create();
  var browserSyncSpa = require('browser-sync-middleware-spa');
  var bump = require('gulp-bump');
  var uglify = require('gulp-uglify');
  var minify = require('gulp-minify');
  var concat = require('gulp-concat');
  var useref = require('gulp-useref');
  var gulpif = require('gulp-if');
  var sonar = require('gulp-sonar');
  var packageJson = require('./package.json');
  var replaceTask = require('gulp-replace-task');
  var baseDir = __dirname + '/app/index.html';
  var minifyCss = require('gulp-minify-css');
  var uncache = require('gulp-uncache');
  var replace = require('gulp-replace');
  var runSequence = require('run-sequence');

  gulp.task('browser-sync', function() {
    browserSync.init({
      server: {
        open: 'external',
        baseDir: '../',
        middleware: [
          //browserSyncSpa(/^[^\.]+$/, baseDir),

          function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
          }
        ]
      },
      startPath: 'otus-exam-normalizer/app'
    });

    gulp.watch([
      'app/**/*.html',
      'app/**/*.js',
      'app/**/*.css'
    ]).on('change', browserSync.reload);
  });

  gulp.task('upgrade-version', function(value) {
    gulp.src('./package.json')
      .pipe(bump({
        version: process.env.npm_config_value
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('compress-compress', function() {
    return gulp.src('app/*.html', {
        allowEmpty: true
      })
      .pipe(useref({
        transformPath: function(filePath) {
          return filePath.replace('otus-exam-normalizer/app', 'otus-exam-normalizer');
        }
      }))
      .pipe(gulpif('*.js', uglify()))
      .pipe(gulpif('*.css', minifyCss()))
      .pipe(gulpif('*.css', replace('url(../../static-resource/', 'url(/otus-exam-normalizer/app/static-resource/')))
      .pipe(gulpif('index.html', replace('href="css', 'href="dist/exam-normalizer/css')))
      .pipe(gulpif('index.html', replace('src="scripts', 'src="dist/exam-normalizer/scripts')))
      .pipe(gulp.dest('dist/exam-normalizer'));
  });

  gulp.task('compress-hash', function() {
    return gulp.src('dist/exam-normalizer/index.html')
      .pipe(uncache({
        append: 'hash',
        rename: true
      }))
      .pipe(gulp.dest('dist/exam-normalizer'));
  });

  gulp.task('compress', function() {
    runSequence('compress-compress', 'compress-hash');
  });

  gulp.task('sonar', function() {
    var options = {
      sonar: {
        host: {
          url: process.env.npm_config_sonarUrl,
        },
        login: process.env.npm_config_sonarDatabaseUsername,
        password: process.env.npm_config_sonarDatabasePassword,
        projectKey: 'sonar:' + packageJson.name,
        projectName: packageJson.name,
        projectVersion: packageJson.version,
        sources: 'app',
        language: 'js',
        sourceEncoding: 'UTF-8',
        exec: {
          maxBuffer: 1024 * 1024
        },
        javascript: {
          lcov: {
            reportPath: 'target/test-coverage/report-lcov/lcov.info'
          }
        }
      }
    };

    return gulp.src('thisFileDoesNotExist.js', {
        read: false
      })
      .pipe(sonar(options));
  });

}());
