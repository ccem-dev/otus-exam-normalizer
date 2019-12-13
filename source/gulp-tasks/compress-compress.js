var gulp = require('gulp');
var useref = require('gulp-useref');
var babel = require('gulp-babel');
var replace = require('gulp-replace');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gulp_if = require('gulp-if');
var embedTemplates = require('gulp-angular-embed-templates');
var clean = require('gulp-clean');

gulp.task('compress-compress', function () {
    return gulp.src('app/*.html')
        .pipe(useref({
            transformPath: function (filePath) {
                if (filePath.includes('node_modules')) {
                    console.log(filePath)
                }
                return filePath.replace('app/app', 'app')
                    .replace('app/node_modules', 'node_modules');
            }
        }))
        .pipe(gulp_if('*.js',
            babel({
                presets: ['es2015']
            })
        ))
        .pipe(gulp_if('*.js', embedTemplates({
            basePath: '.'
        })))
        .pipe(gulp_if('*.css', minifyCss()))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy_code', ()=> {
    return gulp.src('./app/**/*')
    .pipe(gulp_if('index.html', replace('src="app/', 'src="')))
    .pipe(gulp_if('index.html', replace('href="app/', 'href="')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('embeded_template', ()=> {
    return gulp.src('./dist/**/*')
        .pipe(gulp_if('*.js', embedTemplates({
            basePath: '.'
        })))
        .pipe(gulp_if('ux-component/**/*.js', replace('app/', '')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy_node_modules', function () {
    return gulp.src('./node_modules/**/*')
        .pipe(gulp.dest('dist/node_modules'));
});

gulp.task('clean_dist', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
});

