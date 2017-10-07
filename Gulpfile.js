var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var fileinclude = require('gulp-file-include');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

var distPath = 'dist/';
var styleSrc = 'styles/**/*.scss';
var jsSrc = 'js/**/*.js';
var htmlSrc = 'templates/**/*.html';

gulp.task('styles', function () {
  gulp.src(styleSrc)
      // .pipe(sourcemaps.init())
      .pipe(sass(sassOptions).on('error', sass.logError))
      // .pipe(sourcemaps.write(distPath))
      .pipe(concat('app.css'))
      .pipe(autoprefixer(autoprefixerOptions))
      .pipe(gulp.dest(distPath));
});


gulp.task('js', function () {
  gulp.src(jsSrc)
      .pipe(concat('app.js'))
      .pipe(gulp.dest(distPath));
});

gulp.task('fileinclude', function() {
  gulp.src(['templates/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./'));
});


gulp.task('default', function () {
  gulp.watch(styleSrc, ['styles']);
  gulp.watch(jsSrc, ['js']);
  gulp.watch(htmlSrc, ['fileinclude']);
  gulp.watch(['index.html'], ['fileinclude']);
  gulp.watch(htmlSrc, ['fileinclude']);
});