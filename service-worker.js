const CACHE_NAME = "boss-helper-v1";


const FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./assets/square_blue.png",

    "./assets/cross_red.png",

    "./assets/circle_orange.png",

    "./assets/triangle_green.png",

    "./assets/diamond_purple.png",

    "./assets/moon_grey.png",

    "./assets/skull_white.png",

    "./assets/star_yellow.png"

];



self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(FILES))

    );

});



self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => response || fetch(event.request))

    );

});