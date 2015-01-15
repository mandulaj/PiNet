var gulp = require('gulp'),
  mocha = require("gulp-mocha"),
  istanbul = require("gulp-istanbul"),
  coveralls = require('gulp-coveralls'),

  uglify = require('gulp-uglify'),
  nodemon = require('gulp-nodemon'),
  minifyCSS = require('gulp-minify-css'),
  less = require('gulp-less'),
  jade = require('gulp-jade'),
  plumber = require('gulp-plumber'),
  changed = require('gulp-changed'),
  rename = require('gulp-rename'),
  prefix = require('gulp-autoprefixer');


var paths = {
  images: 'src/images/*',
  scripts: 'src/js/*.js',
  less: 'src/less/*.less',
  jade: 'src/jade/*.jade'
};


gulp.task('test', function(cb) {
  gulp.src(['lib/**/*.js', 'config/lib/**/*.js'])
    .pipe(istanbul()) // Covering files
    .on('finish', function() {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
        .on('end', cb);
    });
});

gulp.task('coverage', function() {
  gulp.src("coverage/lcov.info")
    .pipe(coveralls());
});


gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(changed('public/js'))
    //.pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(plumber())
    .pipe(changed("public/images"))
    .pipe(gulp.dest('public/images'));
});

gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(plumber())
    .pipe(changed('public/css'))
    .pipe(less({
      keepSpecialComments: 0,
    }))
    .pipe(prefix(["last 2 version", "> 1%", "ie 8", "ie 7", "Opera"], {
      cascade: true
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('public/css'));
});

gulp.task('jade', function() {
  return gulp.src(paths.jade)
    .pipe(plumber())
    .pipe(changed('public/jadeTest'))
    .pipe(jade({
      pretty: true
    }))
    .pipe(rename({
      extname: ".ejs"
    }))
    .pipe(gulp.dest('views'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.less, ['less']);
  gulp.watch(paths.jade, ['jade']);
});

gulp.task('develop', function() {
  nodemon({
      script: 'bin/www',
      ext: 'html js',
      ignore: ['src/**', 'public/**']
    })
    .on('restart', function() {
      console.log('restarted!');
    });
});


gulp.task('default', ['jade', 'scripts', 'images', 'watch', 'less', 'develop'], function() {
  console.log("Gulp is starting...");
});