//include gulp
var gulp = require('gulp');

//include the plugins
var jshint = require('gulp-jshint');
var minifyHTML = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');

//copy lib files
gulp.task('copyLibFiles',function(){
  return gulp.src('./src/js/lib/*.*')
         .pipe(gulp.dest('./build/js/lib')); 
});

// js lint task
gulp.task('lint', function() {
  return  gulp.src('./src/js/*.js')
          .pipe(jshint())
          .pipe(jshint.reporter('default'));
});

//minify html pages
gulp.task('minifyHtmlPages', function(){
  return gulp.src('./src/*.html')
             .pipe(minifyHTML())
             .pipe(gulp.dest('./build'));
});

//minify mainjs
gulp.task('uglifyjs',function(){
  return gulp.src('./src/js/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('./build/js/'));
});

//minify  css
gulp.task('minifycss', function(){
  return gulp.src('./src/css/*.css')
  .pipe(minifyCSS())
  .pipe(gulp.dest('./build/css/'));
});

gulp.task('default',
  [
  'copyLibFiles',
  'lint',
  'minifyHtmlPages',
  'minifycss',
  'uglifyjs'
    ],function(){

});