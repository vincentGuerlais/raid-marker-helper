const CACHE_NAME = "raid-marker-v2";


const FILES = [

    "./",

    "./index.html",

    "./app.js",

    "./style.css",

    "./service-worker.js",

    "../assets/circle_orange.png",

    "../assets/cross_red.png",

    "../assets/diamond_purple.png",

    "../assets/moon_grey.png",

    "../assets/skull_white.png",

    "../assets/square_blue.png",

    "../assets/star_yellow.png",

    "../assets/triangle_green.png"

];


self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES))

    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))

            );

        })

    );

});


self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
        .then(response => response || fetch(event.request))

    );

});
