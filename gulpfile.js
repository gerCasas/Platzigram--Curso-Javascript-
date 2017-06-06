var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var babel = require('babelify');
var browserify = require('browserify');
var souce = require('vinyl-source-stream');

// genera el app.css y lo pone en la carpeta public
gulp.task('styles', function () {
  gulp
    .src('index.scss')
    .pipe(sass())
    .pipe(rename('app.css'))
    .pipe(gulp.dest('public'));
})

// todo lo que este dentro de la carpeta assets lo mueve a la carpeta public
gulp.task('assets', function () {
  gulp
    .src('assets/*')
    .pipe(gulp.dest('public'));
})

gulp.task('scripts', function () {
  browserify('./src/index.js')
    .transform(babel, {presets: ["es2015"]})
    .bundle()
    .pipe(souce('index.js'))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('public'));
});


// tareas a ejecutar dentro del comando gulp
gulp.task('default', ['styles', 'assets', 'scripts'])
