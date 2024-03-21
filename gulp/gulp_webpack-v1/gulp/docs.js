const gulp = require("gulp");
// HTML
const includeHTML = require("gulp-file-include");
const htmlclean = require("gulp-htmlclean");

// SCSS + GLOB IMPORTS + SOURCE MAPS + GROUP MEDIA QUERIES (ломает работу SOURCE MAPS)
const scss = require("gulp-sass")(require("sass"));
const scssGlob = require("gulp-sass-glob");
// const sourceMaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries");

// CSS AUTOPREFIXER
const autoprefixer = require("gulp-autoprefixer");
// MINIFY CSS
const csso = require("gulp-csso");

// IMAGES
const imagemin = require("gulp-imagemin");
const imageminWebp = require("imagemin-webp");
const extReplace = require("gulp-ext-replace");

// SVG
const svgsprite = require("gulp-svg-sprite");

// TYPOGRAF
const typograf = require("gulp-typograf");

// WEBP in HTML & CSS
const webpHTML = require("gulp-webp-retina-html");
const webpCSS = require("gulp-webp-css");

// FILES
const changed = require("gulp-changed");

// REPLACE FILES ROUTE
const replace = require("gulp-replace");

// HANDLING ERRORS
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

// LIVE SERVER
const server = require("gulp-server-livereload");

// CLEAN docs
const clean = require("gulp-clean");

// FILE SYSTEM
const fs = require("fs");

// WEBPACK for JS + BABEL
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

gulp.task("includeHTML:docs", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./docs"))
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
    .pipe(htmlclean())
    .pipe(gulp.dest("./docs"));
});

gulp.task("scss:docs", function () {
  return (
    gulp
      .src("./src/scss/*.scss")
      .pipe(changed("./docs/css/"))
      .pipe(
        plumber({
          errorHandler: notify.onError({
            title: "Styles",
            message: "Error <%= error.message %>",
            sound: false,
          }),
        })
      )
      .pipe(autoprefixer())
      // .pipe(sourceMaps.init())
      .pipe(scssGlob())
      .pipe(webpCSS())
      .pipe(groupMedia())
      .pipe(
        replace(
          /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          "$1$2$3$4$6$1"
        )
      )
      .pipe(scss())
      .pipe(csso())
      // .pipe(sourceMaps.write())
      .pipe(gulp.dest("./docs/css/"))
  );
});

gulp.task("copyImgs:docs", function () {
  return gulp
    .src(["./src/img/**/*.*", "!./src/img/svgicons/**/*"])
    .pipe(changed("./docs/img/"))
    .pipe(imagemin([imageminWebp({ quality: 85 })]))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest("./docs/img/"))
    .pipe(gulp.src(["./src/img/**/*.*", "!./src/img/svgicons/**/*"]))
    .pipe(changed("./docs/img/"))
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
    .pipe(gulp.dest("./docs/img/"));
});

gulp.task("svgSprite:docs", function () {
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
    .pipe(gulp.dest("./docs/img/svgsprite/"));
});

gulp.task("fonts:docs", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./docs/fonts/"))
    .pipe(gulp.dest("./docs/fonts/"));
});

gulp.task("files:docs", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./docs/files/"))
    .pipe(gulp.dest("./docs/files/"));
});

gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./docs/js"))
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
    .pipe(gulp.dest("./docs/js"));
});

gulp.task("startServer:docs", function () {
  return gulp.src("./docs/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

gulp.task("cleanDocs:docs", function (done) {
  if (fs.existsSync("./docs/")) {
    return gulp.src("./docs/", { read: false }).pipe(clean({ force: true }));
  }

  done();
});

// gulp.task("watch:docs", function () {
//   gulp.watch("./src/**/*.html", gulp.parallel("includeHTML:docs"));
//   gulp.watch("./src/scss/**/*.scss", gulp.parallel("scss:docs"));
//   gulp.watch("./src/img/**/*", gulp.parallel("copyImgs:docs"));
//   gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:docs"));
//   gulp.watch("./src/files/**/*", gulp.parallel("files:docs"));
//   gulp.watch("./src/js/**/*.js", gulp.parallel("js:docs"));
// });
