21.03.2024

GULP + WEBPACK (for js modules)
DEV mode & PRODUCTION mode
HTML-SCSS-JS-WEBPACK-BABEL-WEBP-GRAPHICS_COMPRESSION

==========================
====== INSTALLATION ======
==========================
1. initializing project: npm init;
2. installation gulp into project: npm i gulp -D;
3. create gulpfile.js;

===========================
====== APP STRUCTURE ======
===========================
1. create folder src or app (for initial files);
2. create folder build (for dev mode);
2. create folder dist/docs (for production);
3. create folder gulp (for gulp tasks);

===============================
====== INSIDE folder src or app ======
===============================
1. files: index.html;
2. folders: blocks, scss, js, fonts, images...;

=====================
====== !!!!!!! ======
=====================
"src(["app/js/*.js", "!app/js/*.min.js"])" --> src(["app/js/*.{js}"], { ignore: "app/js/*.min.{js}" })"

==================================================
====== Example based integration AVIF, WEBP ======
==================================================
<picture>
    <source type="image/avif" srcset="./img/show.avif 1x, ./img/show@2x.avif 2x" />
    <source type="image/webp" srcset="./img/show.webp 1x, ./img/show@2x.webp 2x" />
    <source type="image/jpeg" srcset="./img/show.jpg 1x, ./img/show@2x.jpg 2x" />
    <img src="./img/show.png" alt='' />
</picture>