export default null;
declare var self: ServiceWorkerGlobalScope;
declare global {
    interface WorkerGlobalScope {
        __WB_MANIFEST: Array<{ revision: null, url: string }>;
    }
}
let cacheNames = {
    code: `code-${__CACHENAME}`,
    asset: "asset-v1",
    webfont: "webfont",
    data: "data-v1"
};

self.addEventListener("install", function (event) {
    let dividedAssets = self.__WB_MANIFEST.reduce((acc, next) => {
        if (next.url.indexOf("favicons/") > -1) {
            acc.asset.push(next.url);
        }
        else if (!next.url.endsWith(".bmp")) {
            acc.code.push(next.url);
        }
        return acc;
    }, { asset: [], code: [] });
    let definedCaches = [
        {
            name: cacheNames.code,
            assets: [
                ...dividedAssets.code
            ]
        },
        {
            name: cacheNames.asset,
            assets: dividedAssets.asset,
        },
        {
            name: cacheNames.webfont,
            assets: ["https://fonts.googleapis.com/icon?family=Material+Icons",
                "https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap"
            ]
        }
    ];
    event.waitUntil((async () => {
        let tasks = definedCaches.map(async c => {
            let cache = await caches.open(c.name);
            await cache.addAll(c.assets);
        });
        await Promise.all(tasks);
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        let storedCaches = await caches.keys();
        let expectedCaches = Object.values(cacheNames);
        let tasks = storedCaches.filter(c => expectedCaches.indexOf(c) < 0).map(async c => {
            await caches.delete(c);
        })
        await Promise.all(tasks);
    })());
});


self.addEventListener("fetch", function (event) {
    if (event.request.mode === "navigate") {
        if (event.request.method !== "GET") {
            return;
        }
        event.respondWith(caches.match("index.html", { cacheName: cacheNames.code }).then(response => {
            return response || fetch(event.request);
        }));
        return;
    }
    event.respondWith(
        caches.match(event.request).then(async (response) => {
            if (response) {
                return response;
            }
            else {
                let res = await fetch(event.request);
                if (["https://fonts.gstatic.com",
                    "https://fonts.googleapis.com"].some(url => event.request.url.startsWith(url))) {
                    let cache = await caches.open(cacheNames.webfont);
                    await cache.put(event.request, res.clone());
                }
                else if (event.request.url.endsWith(".bmp")) {
                    let cache = await caches.open(cacheNames.data);
                    await cache.put(event.request, res.clone());
                }
                return res;
            }
        })
    );
});