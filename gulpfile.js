var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
    nodemon = require('gulp-nodemon'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer');


var paths = {
    images: 'src/images/*',
    scripts: 'src/js/*.js',
    less: 'src/less/*.less'
};

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
      //.pipe(uglify())
      .pipe(gulp.dest('public/js'));
});


gulp.task('images', function() {
 return gulp.src(paths.images)
    .pipe(gulp.dest('public/images'));
});

gulp.task('less',function() {
    return gulp.src(paths.less)
        .pipe(less({
            keepSpecialComments: 0,
        }))
        .pipe(prefix(["last 2 version", "> 1%", "ie 8", "ie 7", "Opera"], { cascade: true }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.less, ['less']);
});

gulp.task('develop', function () {
  nodemon({ script: 'bin/www', ext: 'html js', ignore: ['src/**','public/**'] })
    .on('restart', function () {
      console.log('restarted!');
    });
});


gulp.task('default', ['scripts', 'images', 'watch','less','develop'], function() {
  console.log("Gulp is starting...");
});
