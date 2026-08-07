const CACHE_NAME = "raid-helper-home-v2";


const FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./manifest.json",

    "./service-worker.js",

    "./assets/icon-192.png",

    "./assets/icon-512.png"

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
