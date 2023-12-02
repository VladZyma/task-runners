HTML-SCSS-JS-AVIF-WEBP-SVG SPRITE-FONTS

====== INSTALLATION ======
1. initializing project: npm init;
2. installation gulp into project: npm i gulp -D;
3. create gulpfile.js;

====== APP STRUCTURE ======
1. create folder app (for development);
2. create folder dist (for production);

====== INSIDE folder APP ======
1. files: index.html;
2. folders: scss, js, fonts, images...;


====== !!!!!!! ======
"src(["app/js/*.js", "!app/js/*.min.js"])" --> src(["app/js/*.{js}"], { ignore: "app/js/*.min.{js}" })"

====== Example based integration AVIF ======
<picture>
    <source type="image/avif" srcset="./to/show.avif" />
    <source type="image/webp" srcset="./to/show.webp" />
    <img src="./to/show.png">
</picture>