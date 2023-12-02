const { src, dest, watch, parallel, series } = require("gulp");
// SCSS --> CSS
const scss = require("gulp-sass")(require("sass"));

//AUTOPREFIXER for css
const autoprefixer = require("gulp-autoprefixer");

// CONCAT files and CHANGE NAME
const concat = require("gulp-concat");

// COMPRESS JS files
const uglify = require("gulp-uglify-es").default;

// IMAGES
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");

// FONTS
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

// INCLUDE HTML
const includeHTML = require("gulp-include");

// CACHE
const newer = require("gulp-newer");

// AUTO UPDATE page
const browserSync = require("browser-sync").create();

// DELETE files
const clean = require("gulp-clean");

function buildStyles() {
  return src(["./app/scss/style.scss"])
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true,
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("./app/css"))
    .pipe(browserSync.stream());
}

function buildScripts() {
  return src(["./app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("./app/js"))
    .pipe(browserSync.stream());
}

function buildImages() {
  return src(["./app/images/src/*.*", "!./app/images/src/*.svg"])
    .pipe(newer("./app/images/dist"))
    .pipe(avif({ quality: 50 }))

    .pipe(src(["./app/images/src/*.*"]))
    .pipe(newer("./app/images/dist"))
    .pipe(webp())

    .pipe(src(["./app/images/src/*.*"]))
    .pipe(newer("./app/images/dist"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("./app/images/dist"));
}

function buildSvgSprite() {
  return src("./app/images/dist/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("./app/images/dist"));
}

function buildFonts() {
  return src("./app/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("./app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("./app/fonts"));
}

function buildHTML() {
  return src("./app/pages/*.html")
    .pipe(includeHTML({ includePaths: "./app/components" }))
    .pipe(dest("./app"))
    .pipe(browserSync.stream());
}

function watching() {
  watch(["./app/**/*.html"]).on("change", browserSync.reload);
  watch(["./app/components/*", "./app/pages/*"], buildHTML);
  watch(["./app/scss/style.scss"], buildStyles);
  watch(["./app/images/src"], buildImages);
  watch(["./app/js/main.js"], buildScripts);
}

function syncBrowser() {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
  });
}

function cleanDist() {
  return src("./dist").pipe(clean());
}

function buildApp() {
  return src(
    [
      "./app/**/*.html",
      "./app/css/style.min.css",
      "./app/images/dist/*.*",
      "!./app/images/dist/*.svg",
      "!./app/images/dist/stack",
      "./app/images/dist/sprite.svg",
      "./app/fonts/*.*",
      "./app/js/main.min.js",
    ],
    { base: "app" }
  ).pipe(dest("./dist"));
}

exports.buildStyles = buildStyles;
exports.buildScripts = buildScripts;
exports.buildImages = buildImages;
exports.buildSvgSprite = buildSvgSprite;
exports.buildFonts = buildFonts;
exports.buildHTML = buildHTML;

exports.watching = watching;
exports.syncBrowser = syncBrowser;

exports.build = series(cleanDist, buildApp);

exports.default = parallel(
  buildHTML,
  buildStyles,
  buildScripts,
  buildImages,
  buildFonts,
  syncBrowser,
  watching
);
