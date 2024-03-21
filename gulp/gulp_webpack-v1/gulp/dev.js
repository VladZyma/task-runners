const gulp = require("gulp");
// HTML
const includeHTML = require("gulp-file-include");

// SCSS + GLOB IMPORTS + SOURCE MAPS + GROUP MEDIA QUERIES (ломает работу SOURCE MAPS)
const scss = require("gulp-sass")(require("sass"));
const scssGlob = require("gulp-sass-glob");
const sourceMaps = require("gulp-sourcemaps");
// const groupMedia = require("gulp-group-css-media-queries");

// IMAGES
const imagemin = require("gulp-imagemin");
const imageminWebp = require("imagemin-webp");
const extReplace = require("gulp-ext-replace");

// WEBP in HTML & CSS
const webpHTML = require("gulp-webp-retina-html");
const webpCSS = require("gulp-webp-css");

// SVG
const svgsprite = require("gulp-svg-sprite");

// TYPOGRAF
const typograf = require("gulp-typograf");

// FILES
const changed = require("gulp-changed");

// REPLACE FILES ROUTE
const replace = require("gulp-replace");

// HANDLING ERRORS
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

// LIVE SERVER
const server = require("gulp-server-livereload");

// CLEAN build
const clean = require("gulp-clean");

// FILE SYSTEM
const fs = require("fs");

// WEBPACK for JS + BABEL
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

gulp.task("includeHTML:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./build", { hasChanged: changed.compareContents }))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "HTML",
          message: "Error <%= error.message %>",
          sound: false,
        }),
      })
    )
    .pipe(
      includeHTML({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1./$4$5$7$1"
      )
    )
    .pipe(
      typograf({
        locale: ["ru", "en-US"],
        htmlEntity: { type: "digit" },
        safeTags: [
          ["<\\?php", "\\?>"],
          ["<no-typography>", "</no-typography>"],
        ],
      })
    )
    .pipe(
      webpHTML({
        extensions: ["jpg", "jpeg", "png", "gif", "webp"],
        retina: {
          1: "",
          2: "@2x",
        },
      })
    )
    .pipe(gulp.dest("./build"));
});

gulp.task("scss:dev", function () {
  return (
    gulp
      .src("./src/scss/*.scss")
      .pipe(changed("./build/css/"))
      .pipe(
        plumber({
          errorHandler: notify.onError({
            title: "Styles",
            message: "Error <%= error.message %>",
            sound: false,
          }),
        })
      )
      .pipe(sourceMaps.init())
      .pipe(scssGlob())
      // .pipe(groupMedia())
      .pipe(
        replace(
          /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          "$1$2$3$4$6$1"
        )
      )
      .pipe(scss())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest("./build/css/"))
  );
});

gulp.task("copyImgs:dev", function () {
  return gulp
    .src(["./src/img/**/*.*", "!./src/img/svgicons/**/*"])
    .pipe(changed("./build/img/"))
    .pipe(imagemin([imageminWebp({ quality: 85 })]))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest("./build/img/"))
    .pipe(gulp.src(["./src/img/**/*.*", "!./src/img/svgicons/**/*"]))
    .pipe(changed("./build/img/"))
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 85, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
        ],
        { verbose: true }
      )
    )
    .pipe(gulp.dest("./build/img/"));
});

gulp.task("svgSprite:dev", function () {
  return gulp
    .src("./src/img/svgicons/**/*.svg")
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "SVG Sprite",
          message: "Error <%= error.message %>",
          sound: false,
        }),
      })
    )
    .pipe(
      svgsprite({
        mode: {
          symbol: {
            sprite: "../sprite.symbol.svg",
          },
        },
        shape: {
          transform: [
            {
              svgo: {
                js2svg: { indent: 4, pretty: true },
                plugins: [
                  {
                    name: "removeAttrs",
                    params: {
                      attrs: "(fill|stroke)",
                    },
                  },
                ],
              },
            },
          ],
        },
      })
    )
    .pipe(gulp.dest("./build/img/svgsprite/"));
});

gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});

gulp.task("files:dev", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"));
});

gulp.task("js:dev", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./build/js"))
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "JS",
          message: "Error <%= error.message %>",
          sound: false,
        }),
      })
    )
    .pipe(babel())
    .pipe(webpack(require("../webpack.config")))
    .pipe(gulp.dest("./build/js"));
});

gulp.task("startServer:dev", function () {
  return gulp.src("./build/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

gulp.task("cleanBuild:dev", function (done) {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean({ force: true }));
  }

  done();
});

gulp.task("watch:dev", function () {
  gulp.watch("./src/**/*.html", gulp.parallel("includeHTML:dev"));
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("scss:dev"));
  gulp.watch("./src/img/**/*", gulp.parallel("copyImgs:dev"));
  gulp.watch("./src/img/svgicons/**/*.svg", gulp.parallel("svgSprite:dev"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/files/**/*", gulp.parallel("files:dev"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev"));
});
