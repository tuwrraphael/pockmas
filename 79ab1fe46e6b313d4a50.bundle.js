!function(){var t,e,s,r,n,i={8738:function(t,e,s){"use strict";s.d(e,{W:function(){return h}}),s(3948),s(1637),s(285);class r{constructor(t,e){this.routeResolver=t,this.routeRenderer=e,this.lastRoute=null,this.popStateListener=this.handlePopState.bind(this)}handlePopState(t){this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((t=>this.render(t)))}run(){let t=document.querySelector("base");this.basePrefix=t.getAttribute("href"),this.baseHref=t.href,window.addEventListener("popstate",this.popStateListener),this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((t=>this.render(t)))}destroy(){window.removeEventListener("popstate",this.popStateListener)}resolve(t,e){let s=this.getRoute(t);return Promise.resolve(this.routeResolver.resolve(this.lastRoute,s,this,e)).then((t=>!!t&&{resolved:t,currentRoute:s}))}render(t){return!!t&&(this.routeRenderer.render(t.resolved),this.lastRoute=t.currentRoute,!0)}getRoute(t){let e=t===this.baseHref,s=t.substr(0,this.basePrefix.length)===this.basePrefix;return e?"":s?t.substring(this.basePrefix.length):t}navigate(t,e,s){let r=new URL(t,this.baseHref);this.resolve(r.pathname,r).then((t=>{t&&(s?window.history.replaceState({},e||document.title,r.href):window.history.pushState({},e||document.title,r.href)),this.render(t)}))}}class n{constructor(t){this.itineraryUrlEncoded=t,this.type=6}}var i=s(4657),a=s(2499);class o{constructor(t,e){this.departure=t,this.arrival=e,this.type=4}}const l="dsg",c="asg";class u{constructor(t){this.container=t,this.currentComponent=null}render(t){t&&t!==this.currentComponent&&(this.currentComponent&&(this.container.innerHTML=""),this.container.appendChild(t),this.currentComponent=t)}}class h{static getInstance(){return null==this.instance&&(this.instance=new h),this.instance}setCurrentElement(t){return this.currentElement=t,t}search(t,e){let s=new URLSearchParams;s.set(l,t.toString()),e&&s.set(c,e.toString()),this.router.navigate("s?".concat(s),"pockmas - Suchergebnisse")}constructor(){this.currentElement=null,this.store=i.y.getInstance();let t=this,e=document.querySelector(".content");this.router=new r(new class{parseSearchRoute(t,e){if("s"==t){if(!e.has(l))return null;let t,s=parseInt(e.get(l));return isNaN(s)||e.has(c)&&(t=parseInt(e.get(c)),isNaN(t))?null:{from:s,to:t}}return null}async resolve(e,r,i,l){if(/^r\/(\S+)$/.test(r)){let e=RegExp.$1;t.store.postAction(new n(e));let{RouteDetails:r}=await s.e(268).then(s.bind(s,5268));return t.setCurrentElement(new r)}let c=this.parseSearchRoute(r,l.searchParams);if(null!=c){if(t.store.postAction(new o(c.from,c.to)),t.currentElement instanceof a.RouteResults)return t.currentElement;{let{RouteResults:e}=await Promise.resolve().then(s.bind(s,2499));return t.setCurrentElement(new e)}}let{RouteResults:u}=await Promise.resolve().then(s.bind(s,2499));return new u}},new u(e))}}h.instance=null},2499:function(t,e,s){"use strict";s.r(e),s.d(e,{RouteResults:function(){return o}}),s(6699),s(3948);class r{constructor(t){this.increment=t,this.type=5}}var n=s(4657),i=s(3277),a=s(8738);class o extends HTMLElement{constructor(){super(),this.rendered=!1,this.store=n.y.getInstance(),this.appRouter=a.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div class="route-results__header" style="display:none"> <a class="route-results__tab-title" id="tab-title-abfahrten"> <h1>Abfahrtsmonitor</h1> </a> <a class="route-results__tab-title" id="tab-title-routen"> <h1>Routen</h1> </a> </div> <div class="button-pane"> <button type="button" class="button" id="add-5-min">5 min später</button> </div>',this.rendered=!0,this.addMinBtn=this.querySelector("#add-5-min"),this.tabTitleAbfahrten=this.querySelector("#tab-title-abfahrten"),this.tabTitleRouten=this.querySelector("#tab-title-routen"),this.header=this.querySelector(".route-results__header"),(0,i.I)(this.addMinBtn,"click",(()=>{this.store.postAction(new r(3e5))}),this.abortController.signal),(0,i.I)(this.tabTitleAbfahrten,"click",(t=>{t.preventDefault(),this.appRouter.search(this.departureStopGroupId,null)}),this.abortController.signal)),this.store.subscribe(((t,e)=>this.update(t,e)),this.abortController.signal)}async update(t,e){var s;(e.includes("results")||e.includes("departures"))&&(this.hasAbfahrten=null!=t.departures&&t.departures.length>0,this.hasRouten=null!=t.results&&t.results.length>0,this.render()),e.includes("selectedStopgroups")&&(this.departureStopGroupId=null===(s=t.selectedStopgroups.departure)||void 0===s?void 0:s.id)}async render(){let t=this.hasRouten;this.tabTitleAbfahrten.classList.toggle("route-results__tab-title--disabled",t),this.tabTitleRouten.classList.toggle("route-results__tab-title--disabled",!t),this.tabTitleAbfahrten.style.display=this.departureStopGroupId?"":"none",this.tabTitleAbfahrten.href="s?dsg=".concat(this.departureStopGroupId),this.tabTitleRouten.style.display=this.hasRouten?"":"none",this.header.style.display=this.hasAbfahrten||this.hasRouten?"":"none",t&&null==this.routeResultsList?(this.routeResultsList=new((await Promise.all([s.e(653),s.e(918)]).then(s.bind(s,6102))).RouteResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.routeResultsList)):t||null==this.routeResultsList||(this.routeResultsList.remove(),this.routeResultsList=null),t||null!=this.departureResultsList?t&&null!=this.departureResultsList&&(this.departureResultsList.remove(),this.departureResultsList=null):(this.departureResultsList=new((await Promise.all([s.e(653),s.e(274)]).then(s.bind(s,3690))).DepartureResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.departureResultsList))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results",o)},8626:function(t,e,s){"use strict";s(6699),s(3948);class r extends HTMLElement{constructor(){super(),this.popupShown=!1,this.source=this,this.keyListener=this.keyListener.bind(this),this.clickListener=this.clickListener.bind(this)}connectedCallback(){this.updateStyles()}keyListener(t){"Escape"==t.key&&this.hide()}setSource(t){this.source=t}clickListener(t){this.source.contains(t.target)||this.hide()}hide(){this.popupShown&&(document.removeEventListener("keydown",this.keyListener),document.removeEventListener("click",this.clickListener),this.popupShown=!1,this.updateStyles())}show(){this.popupShown||(document.addEventListener("keydown",this.keyListener),document.addEventListener("click",this.clickListener),this.popupShown=!0,this.updateStyles())}updateStyles(){this.style.display=this.popupShown?"":"none"}toggle(){this.popupShown?this.hide():this.show()}disconnectedCallback(){this.hide()}}customElements.define("app-popup",r);var n=s(3277);const i="label";class a extends HTMLElement{constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<button class="search-result-card__button"> <span class="search-result-card__text"></span> </button>',this.rendered=!0,this.text=this.querySelector(".search-result-card__text")),this.updateAttributes()}attributeChangedCallback(){this.updateAttributes()}updateAttributes(){if(!this.rendered)return;let t=this.getAttribute(i);this.text.innerText=t}static get observedAttributes(){return[i]}disconnectedCallback(){}}customElements.define("search-result-card",a);const o="label";class l extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<button class="stop-search"> <label class="stop-search__label"></label> <div> <span class="stop-search__selected-result-label">auswählen</span> </div> </button> <app-popup> <div class="stop-search__search"> <div class="stop-search__search-input-container"> <label class="stop-search__label"></label> <input placeholder="Suche eine Station" class="stop-search__search-input" type="search" autocomplete="off" autocapitalize="off"> </div> <div class="stop-search__results"> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> </div> </div> </app-popup>',this.rendered=!0,this.labels=Array.from(this.querySelectorAll(".stop-search__label")),this.button=this.querySelector("button"),this.stopSearchPopup=this.querySelector("app-popup"),this.stopSearchPopup.setSource(this),this.input=this.querySelector(".stop-search__search-input"),this.searchResults=Array.from(this.querySelectorAll(".stop-search__search-result")),this.selectedResultLabel=this.querySelector(".stop-search__selected-result-label")),this.updateAttributes(),(0,n.I)(this.button,"click",(t=>this.onClick(t)),this.abortController.signal);for(let t=0;t<this.searchResults.length;t++)(0,n.I)(this.searchResults[t],"click",(e=>this.onSearchResultClick(t)),this.abortController.signal)}onClick(t){this.stopSearchPopup.show(),this.input.focus()}onSearchResultClick(t){this.dispatchEvent(new CustomEvent("stop-selected",{detail:t})),this.stopSearchPopup.hide()}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[o]}updateAttributes(){if(!this.rendered)return;let t=this.getAttribute(o);for(let e of this.labels)e.innerText=t;this.button.setAttribute("title","".concat(t," auswählen")),this.labels[1].setAttribute("for","".concat(t,"-search-input")),this.input.setAttribute("id","".concat(t,"-search-input"))}disconnectedCallback(){this.abortController.abort()}get searchTerm(){return this.input.value}setSelected(t){this.selectedResultLabel.innerText=t||"auswählen"}setResults(t){if(this.rendered)for(let e=0;e<this.searchResults.length;e++)e<t.length?(this.searchResults[e].setAttribute("label",t[e].name),this.searchResults[e].style.display=""):this.searchResults[e].style.display="none"}}customElements.define("stop-search",l);var c=s(4657);class u{constructor(){this.type=0}}class h{constructor(t){this.term=t,this.type=1}}class d{constructor(t){this.term=t,this.type=2}}var p=s(8738);class b extends HTMLElement{constructor(){super(),this.appRouter=p.W.getInstance(),this.store=c.y.getInstance(),this.store.postAction(new u)}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div> <stop-search label="Abfahrt" class="route-search__abfahrt" id="departure-stop-search"></stop-search> <stop-search label="Ziel" id="arrival-stop-search"></stop-search> </div>',this.departureStopSearch=this.querySelector("#departure-stop-search"),this.arrivalStopSearch=this.querySelector("#arrival-stop-search"),this.rendered=!0),this.store.subscribe(((t,e)=>this.update(t,e)),this.abortController.signal),(0,n.I)(this.departureStopSearch,"input",(()=>this.store.postAction(new h(this.departureStopSearch.searchTerm))),this.abortController.signal),(0,n.I)(this.arrivalStopSearch,"input",(()=>this.store.postAction(new d(this.arrivalStopSearch.searchTerm))),this.abortController.signal),(0,n.I)(this.departureStopSearch,"stop-selected",(t=>{var e;this.appRouter.search(this.store.state.departureStopResults[t.detail].id,null===(e=this.store.state.selectedStopgroups.arrival)||void 0===e?void 0:e.id)}),this.abortController.signal),(0,n.I)(this.arrivalStopSearch,"stop-selected",(t=>{var e;this.appRouter.search(null===(e=this.store.state.selectedStopgroups.departure)||void 0===e?void 0:e.id,this.store.state.arrivalStopResults[t.detail].id)}),this.abortController.signal)}update(t,e){var s,r;e.includes("departureStopResults")&&this.departureStopSearch.setResults(t.departureStopResults),e.includes("arrivalStopResults")&&this.arrivalStopSearch.setResults(t.arrivalStopResults),e.includes("selectedStopgroups")&&(this.departureStopSearch.setSelected(null===(s=t.selectedStopgroups.departure)||void 0===s?void 0:s.name),this.arrivalStopSearch.setSelected(null===(r=t.selectedStopgroups.arrival)||void 0===r?void 0:r.name))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-search",b),s(1420),c.y.getInstance().postAction(new class{constructor(){this.type=3}}),p.W.getInstance().router.run()},1420:function(){let t=null;function e(){document.querySelector("#updateready").style.display=""}if(document.querySelector("#update-btn").addEventListener("click",(()=>{t.postMessage({action:"skipWaiting"})})),"serviceWorker"in navigator){window.addEventListener("load",(async()=>{try{let s=await navigator.serviceWorker.register("./sw.js");if(!navigator.serviceWorker.controller)return;let r=s=>{s.addEventListener("statechange",(()=>{"installed"==s.state&&(t=s,e())}))};if(s.waiting)return t=s.waiting,void e();if(s.installing)return void r(s.installing);s.addEventListener("updatefound",(()=>r(s.installing)))}catch(t){console.log("SW registration failed.",t)}}));let s=!1;navigator.serviceWorker.addEventListener("controllerchange",(()=>{s||(s=!0,window.location.reload())}))}},4657:function(t,e,s){"use strict";s.d(e,{y:function(){return r}}),s(3948),s(285),s(1637);class r{get state(){return this._state}static getInstance(){return null==this.instance&&(this.instance=new r),this.instance}constructor(){this._state=null,this.subscriptions=[],this.worker=new Worker(new URL(s.p+s.u(974),s.b)),this.worker.addEventListener("message",(t=>{let[e,s]=t.data;this._state=Object.assign(Object.assign({},this._state),e);for(let t of this.subscriptions)try{t.call(this._state,s)}catch(t){console.error("Error while updating",t)}}))}subscribe(t,e){let s={call:t};this.subscriptions.push(s),e&&e.addEventListener("abort",(()=>{this.subscriptions.splice(this.subscriptions.indexOf(s),1)}))}postAction(t){this.worker.postMessage(t)}}r.instance=null},3277:function(t,e,s){"use strict";function r(t,e,s,r){t.addEventListener(e,s),r.addEventListener("abort",(()=>{t.removeEventListener(e,s)}))}s.d(e,{I:function(){return r}})},8006:function(t,e,s){var r=s(6324),n=s(748).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,n)}},3948:function(t,e,s){var r=s(7854),n=s(8324),i=s(8509),a=s(6992),o=s(8880),l=s(5112),c=l("iterator"),u=l("toStringTag"),h=a.values,d=function(t,e){if(t){if(t[c]!==h)try{o(t,c,h)}catch(e){t[c]=h}if(t[u]||o(t,u,e),n[e])for(var s in a)if(t[s]!==a[s])try{o(t,s,a[s])}catch(e){t[s]=a[s]}}};for(var p in n)d(r[p]&&r[p].prototype,p);d(i,"DOMTokenList")}},a={};function o(t){var e=a[t];if(void 0!==e)return e.exports;var s=a[t]={exports:{}};return i[t](s,s.exports,o),s.exports}o.m=i,t=[],o.O=function(e,s,r,n){if(!s){var i=1/0;for(u=0;u<t.length;u++){s=t[u][0],r=t[u][1],n=t[u][2];for(var a=!0,l=0;l<s.length;l++)(!1&n||i>=n)&&Object.keys(o.O).every((function(t){return o.O[t](s[l])}))?s.splice(l--,1):(a=!1,n<i&&(i=n));if(a){t.splice(u--,1);var c=r();void 0!==c&&(e=c)}}return e}n=n||0;for(var u=t.length;u>0&&t[u-1][2]>n;u--)t[u]=t[u-1];t[u]=[s,r,n]},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,{a:e}),e},o.d=function(t,e){for(var s in e)o.o(e,s)&&!o.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},o.f={},o.e=function(t){return Promise.all(Object.keys(o.f).reduce((function(e,s){return o.f[s](t,e),e}),[]))},o.u=function(t){return{268:"363ada8b3ecb4e54013d",274:"5e1b34d73afaaabf5e66",653:"8101ec42f400c590aac2",918:"39ea1903ed2f2175aa4f",974:"147a8514cb65345359a0"}[t]+".bundle.js"},o.miniCssF=function(t){return t+"."+{268:"8c5b220bf6f482881a90",274:"4ce84a8d3496430f9a81",918:"b3293486a7f0a3284a1f"}[t]+".css"},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e={},s="pockmas:",o.l=function(t,r,n,i){if(e[t])e[t].push(r);else{var a,l;if(void 0!==n)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var h=c[u];if(h.getAttribute("src")==t||h.getAttribute("data-webpack")==s+n){a=h;break}}a||(l=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.setAttribute("data-webpack",s+n),a.src=t),e[t]=[r];var d=function(s,r){a.onerror=a.onload=null,clearTimeout(p);var n=e[t];if(delete e[t],a.parentNode&&a.parentNode.removeChild(a),n&&n.forEach((function(t){return t(r)})),s)return s(r)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=d.bind(null,a.onerror),a.onload=d.bind(null,a.onload),l&&document.head.appendChild(a)}},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.p="/",r=function(t){return new Promise((function(e,s){var r=o.miniCssF(t),n=o.p+r;if(function(t,e){for(var s=document.getElementsByTagName("link"),r=0;r<s.length;r++){var n=(a=s[r]).getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(n===t||n===e))return a}var i=document.getElementsByTagName("style");for(r=0;r<i.length;r++){var a;if((n=(a=i[r]).getAttribute("data-href"))===t||n===e)return a}}(r,n))return e();!function(t,e,s,r){var n=document.createElement("link");n.rel="stylesheet",n.type="text/css",n.onerror=n.onload=function(i){if(n.onerror=n.onload=null,"load"===i.type)s();else{var a=i&&("load"===i.type?"missing":i.type),o=i&&i.target&&i.target.href||e,l=new Error("Loading CSS chunk "+t+" failed.\n("+o+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=a,l.request=o,n.parentNode.removeChild(n),r(l)}},n.href=e,document.head.appendChild(n)}(t,n,e,s)}))},n={826:0},o.f.miniCss=function(t,e){n[t]?e.push(n[t]):0!==n[t]&&{268:1,274:1,918:1}[t]&&e.push(n[t]=r(t).then((function(){n[t]=0}),(function(e){throw delete n[t],e})))},function(){o.b=document.baseURI||self.location.href;var t={826:0};o.f.j=function(e,s){var r=o.o(t,e)?t[e]:void 0;if(0!==r)if(r)s.push(r[2]);else{var n=new Promise((function(s,n){r=t[e]=[s,n]}));s.push(r[2]=n);var i=o.p+o.u(e),a=new Error;o.l(i,(function(s){if(o.o(t,e)&&(0!==(r=t[e])&&(t[e]=void 0),r)){var n=s&&("load"===s.type?"missing":s.type),i=s&&s.target&&s.target.src;a.message="Loading chunk "+e+" failed.\n("+n+": "+i+")",a.name="ChunkLoadError",a.type=n,a.request=i,r[1](a)}}),"chunk-"+e,e)}},o.O.j=function(e){return 0===t[e]};var e=function(e,s){var r,n,i=s[0],a=s[1],l=s[2],c=0;if(i.some((function(e){return 0!==t[e]}))){for(r in a)o.o(a,r)&&(o.m[r]=a[r]);if(l)var u=l(o)}for(e&&e(s);c<i.length;c++)n=i[c],o.o(t,n)&&t[n]&&t[n][0](),t[n]=0;return o.O(u)},s=self.webpackChunkpockmas=self.webpackChunkpockmas||[];s.forEach(e.bind(null,0)),s.push=e.bind(null,s.push.bind(s))}();var l=o.O(void 0,[829],(function(){return o(8626)}));l=o.O(l)}();
//# sourceMappingURL=79ab1fe46e6b313d4a50.bundle.js.map