var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');

gulp.task('scripts', function() {
  return gulp.src('js/app.js')
    .pipe(browserify())
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('styles', function() {
  return gulp.src('scss/main.scss')
    .pipe(sass({style: 'compressed'}))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('default', function() {
    gulp.start('scripts', 'styles');
});

gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['styles']);
  gulp.watch('js/*.js', ['scripts']);
});