!function(){"use strict";let e={code:"code-3d53ed57736f1cd2ad6c7ad14f2cf99f8c58754c",asset:"asset-v2",webfont:"webfont-v2",data:"data-v1"},t=[{'revision':null,'url':'/07b3c6dcc5dcee8490e5.bundle.js'},{'revision':null,'url':'/102.49b5db72ec40d16bec59.css'},{'revision':null,'url':'/12f354b5a4008c605d98.bundle.js'},{'revision':null,'url':'/148.a1312c6487cfa5e4a385.css'},{'revision':null,'url':'/349baa5ee18c799559a0.bundle.js'},{'revision':null,'url':'/351daa55156e49690407.wasm'},{'revision':null,'url':'/355f516c704b4163eba7.svg'},{'revision':null,'url':'/690.6814388e82313c206c94.css'},{'revision':null,'url':'/8349f0ed2e30663a2efb.wasm'},{'revision':null,'url':'/94c5517983b78c1dbf18.bundle.js'},{'revision':null,'url':'/96e99bd992fa95096738.bundle.js'},{'revision':null,'url':'/cf2ba67cb39b9f196a8e.bundle.js'},{'revision':null,'url':'/d13341cea26bfc220f1e.bundle.js'},{'revision':null,'url':'/d4268ce26895ae77f04d.svg'},{'revision':null,'url':'/data/341146013d4e4360b611.json'},{'revision':null,'url':'/data/4d9de5f34e6eed76c521.json'},{'revision':null,'url':'/data/67f6d2873901363af326.json'},{'revision':null,'url':'/data/7fa4c0c6201a586f19da.bmp'},{'revision':null,'url':'/data/c63ea8f4424dbcf844e8.json'},{'revision':null,'url':'/data/f6821312800bfdef56c2.bmp'},{'revision':null,'url':'/data/fb5a04f9f38a43c78cef.json'},{'revision':'9553f19719f79ea63afc927f9ff26238','url':'/favicons/android-chrome-192x192.png'},{'revision':'d74b92f2f61e3c1a1073ef163ba15401','url':'/favicons/android-chrome-512x512.png'},{'revision':'23b3b7bcd64e8657c65d1a694ac8669b','url':'/favicons/apple-touch-icon.png'},{'revision':'a493ba0aa0b8ec8068d786d7248bb92c','url':'/favicons/browserconfig.xml'},{'revision':'831b8f4c38087b53386213f65fd7ab50','url':'/favicons/favicon-16x16.png'},{'revision':'08e430c4775a1ac3a9a23ae26f987fd1','url':'/favicons/favicon-32x32.png'},{'revision':'5f5df2ac0eab2b95aa76701ee66fbe72','url':'/favicons/favicon.ico'},{'revision':'1a6130dbed2dc19bc0fd3c687376660f','url':'/favicons/mstile-144x144.png'},{'revision':'9e8c77022c14dd1c543260c9fcb88fbb','url':'/favicons/mstile-150x150.png'},{'revision':'c84d74c640b8f5ae163833e65b7c0ae7','url':'/favicons/mstile-310x150.png'},{'revision':'506fa0e81db632b650ce2f48f49d0dc5','url':'/favicons/mstile-310x310.png'},{'revision':'c6db4c2c144868030343fcf72b9beaf9','url':'/favicons/mstile-70x70.png'},{'revision':'b9aa277fcfc34c31db6c7a7ea3469b8c','url':'/favicons/site.webmanifest'},{'revision':null,'url':'/index.653282930061a59ef1af.css'},{'revision':'74cee3c8190842a8a594b80e4df4e0b9','url':'/index.html'},{'revision':'8314d1c2aa692d4e6ce27376a4cbf359','url':'/licenses.txt'},{'revision':'447405fb589c955265d630504960e38c','url':'/site.webmanifest'}];self.addEventListener("install",(function(a){let s=t.reduce(((e,t)=>(t.url.indexOf("favicons/")>-1?e.asset.push(t.url):t.url.includes("data/")||e.code.push(t.url),e)),{asset:[],code:[]}),i=[{name:e.code,assets:[...s.code]},{name:e.asset,assets:s.asset},{name:e.webfont,assets:["https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap"]}];a.waitUntil((async()=>{let e=i.map((async e=>{let t=await caches.open(e.name);await t.addAll(e.assets)}));await Promise.all(e)})())})),self.addEventListener("activate",(a=>{a.waitUntil((async()=>{let a=await caches.keys(),s=Object.values(e),i=a.filter((e=>s.indexOf(e)<0)).map((async e=>{await caches.delete(e)}));await Promise.all(i);let c=await caches.open(e.data),n=await c.keys(),l=t.filter((e=>e.url.includes("data/"))).map((e=>e.url));for(let e of n)l.some((t=>e.url.endsWith(t)))||await c.delete(e)})())})),self.addEventListener("fetch",(function(t){if("navigate"!==t.request.mode)t.respondWith(caches.match(t.request).then((async a=>{if(a)return a;{let a=await fetch(t.request);if(["https://fonts.gstatic.com","https://fonts.googleapis.com"].some((e=>t.request.url.startsWith(e)))){let s=await caches.open(e.webfont);await s.put(t.request,a.clone())}else if(t.request.url.includes("data/")){let s=await caches.open(e.data);await s.put(t.request,a.clone())}return a}})));else{if("GET"!==t.request.method)return;t.respondWith(caches.match("index.html",{cacheName:e.code}).then((e=>e||fetch(t.request))))}})),self.addEventListener("message",(e=>{"skipWaiting"===e.data.action&&self.skipWaiting()}))}();
//# sourceMappingURL=sw.js.map