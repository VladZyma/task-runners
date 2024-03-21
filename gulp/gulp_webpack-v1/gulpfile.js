const gulp = require("gulp");

// TASKS
require("./gulp/dev");
require("./gulp/docs");
require("./gulp/fontsDev");
require("./gulp/fontsDocs");

// DEV mode
gulp.task(
  "default",
  gulp.series(
    "cleanBuild:dev",
    "fontsDev",
    gulp.parallel(
      "includeHTML:dev",
      "scss:dev",
      "copyImgs:dev",
      "svgSprite:dev",
      "fonts:dev",
      "files:dev",
      "js:dev"
    ),
    gulp.parallel("startServer:dev", "watch:dev")
  )
);

// PRODUCTION mode
gulp.task(
  "docs",
  gulp.series(
    "cleanDocs:docs",
    "fontsDocs",
    gulp.parallel(
      "includeHTML:docs",
      "scss:docs",
      "copyImgs:docs",
      "svgSprite:docs",
      "fonts:docs",
      "files:docs",
      "js:docs"
    ),
    gulp.parallel("startServer:docs")
  )
);
