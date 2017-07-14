var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var babel = require('babelify');
var browserify = require('browserify');
var souce = require('vinyl-source-stream');
var watchify = require('watchify');

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

function compile(watch) {
  //watchify nos permite saber cuando hay cambios en algun archivo, en este caso es index.js
  var bundle = watchify(browserify('./src/index.js', {debug: true}));

  function rebundle() {
    bundle
      .transform(babel, {presets: ["es2015"]})
      .bundle()
      .on('error', function (err) { console.log(err); this.emit('end') })
      .pipe(souce('index.js'))
      .pipe(rename('app.js'))
      .pipe(gulp.dest('public'));
  }

  if(watch) {
    //escuchar los cambios de los archivos, y si hay evento de update encontes ejecutamos rebundle
    bundle.on('update', function() {
      console.log('--> Bundling...');
      rebundle();
    })
  }

  //puse esta linea por que no estaba estrando al bundle.on
  rebundle();
}

gulp.task('build', function () { return compile(); });

gulp.task('watch', function () { return compile(true); });

// tareas a ejecutar dentro del comando gulp
gulp.task('default', ['styles', 'assets', 'build']);
