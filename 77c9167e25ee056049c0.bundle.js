!function(){var e,t,s,r,n,i={8738:function(e,t,s){"use strict";s.d(t,{W:function(){return h}}),s(3948),s(1637),s(285);class r{constructor(e,t){this.routeResolver=e,this.routeRenderer=t,this.lastRoute=null,this.popStateListener=this.handlePopState.bind(this)}handlePopState(e){this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}run(){let e=document.querySelector("base");this.basePrefix=e.getAttribute("href"),this.baseHref=e.href,window.addEventListener("popstate",this.popStateListener),this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}destroy(){window.removeEventListener("popstate",this.popStateListener)}resolve(e,t){let s=this.getRoute(e);return Promise.resolve(this.routeResolver.resolve(this.lastRoute,s,this,t)).then((e=>!!e&&{resolved:e,currentRoute:s}))}render(e){return!!e&&(this.routeRenderer.render(e.resolved),this.lastRoute=e.currentRoute,!0)}getRoute(e){let t=e===this.baseHref,s=e.substr(0,this.basePrefix.length)===this.basePrefix;return t?"":s?e.substring(this.basePrefix.length):e}navigate(e,t,s){let r=new URL(e,this.baseHref);this.resolve(r.pathname,r).then((e=>{e&&(s?window.history.replaceState({},t||document.title,r.href):window.history.pushState({},t||document.title,r.href)),this.render(e)}))}}class n{constructor(e){this.itineraryUrlEncoded=e,this.type=6}}var i=s(4657),a=s(2499);class o{constructor(e,t){this.departure=e,this.arrival=t,this.type=4}}const l="dsg",c="asg";class u{constructor(e){this.container=e,this.currentComponent=null}render(e){e&&e!==this.currentComponent&&(this.currentComponent&&(this.container.innerHTML=""),this.container.appendChild(e),this.currentComponent=e)}}class h{constructor(){this.currentElement=null,this.store=i.y.getInstance();let e=this,t=document.querySelector(".content");this.router=new r(new class{parseSearchRoute(e,t){if("s"==e){if(!t.has(l))return null;let e,s=parseInt(t.get(l));return isNaN(s)||t.has(c)&&(e=parseInt(t.get(c)),isNaN(e))?null:{from:s,to:e}}return null}async resolve(t,r,i,l){if(/^r\/(\S+)$/.test(r)){let t=RegExp.$1;e.store.postAction(new n(t));let{RouteDetails:r}=await s.e(268).then(s.bind(s,5268));return e.setCurrentElement(new r)}let c=this.parseSearchRoute(r,l.searchParams);if(null!=c){if(e.store.postAction(new o(c.from,c.to)),e.currentElement instanceof a.RouteResults)return e.currentElement;{let{RouteResults:t}=await Promise.resolve().then(s.bind(s,2499));return e.setCurrentElement(new t)}}let{RouteResults:u}=await Promise.resolve().then(s.bind(s,2499));return new u}},new u(t))}static getInstance(){return null==this.instance&&(this.instance=new h),this.instance}setCurrentElement(e){return this.currentElement=e,e}search(e,t){let s=new URLSearchParams;s.set(l,e.toString()),t&&s.set(c,t.toString()),this.router.navigate("s?".concat(s),"pockmas - Suchergebnisse")}}h.instance=null},2499:function(e,t,s){"use strict";s.r(t),s.d(t,{RouteResults:function(){return o}}),s(6699),s(3948);class r{constructor(e){this.increment=e,this.type=5}}var n=s(4657),i=s(3277),a=s(8738);class o extends HTMLElement{constructor(){super(),this.rendered=!1,this.store=n.y.getInstance(),this.appRouter=a.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div class="route-results__header" style="display:none"> <a class="route-results__tab-title" id="tab-title-abfahrten"> <h1>Abfahrtsmonitor</h1> </a> <a class="route-results__tab-title" id="tab-title-routen"> <h1>Routen</h1> </a> </div> <div class="button-pane"> <button type="button" class="button" id="add-5-min">5 min später</button> </div>',this.rendered=!0,this.addMinBtn=this.querySelector("#add-5-min"),this.tabTitleAbfahrten=this.querySelector("#tab-title-abfahrten"),this.tabTitleRouten=this.querySelector("#tab-title-routen"),this.header=this.querySelector(".route-results__header"),(0,i.I)(this.addMinBtn,"click",(()=>{this.store.postAction(new r(3e5))}),this.abortController.signal),(0,i.I)(this.tabTitleAbfahrten,"click",(e=>{e.preventDefault(),this.appRouter.search(this.departureStopGroupId,null)}),this.abortController.signal)),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal)}async update(e,t){var s;(t.includes("results")||t.includes("departures"))&&(this.hasAbfahrten=null!=e.departures&&e.departures.length>0,this.hasRouten=null!=e.results&&e.results.length>0,this.render()),t.includes("selectedStopgroups")&&(this.departureStopGroupId=null===(s=e.selectedStopgroups.departure)||void 0===s?void 0:s.id)}async render(){let e=this.hasRouten;this.tabTitleAbfahrten.classList.toggle("route-results__tab-title--disabled",e),this.tabTitleRouten.classList.toggle("route-results__tab-title--disabled",!e),this.tabTitleAbfahrten.style.display=this.departureStopGroupId?"":"none",this.tabTitleAbfahrten.href="s?dsg=".concat(this.departureStopGroupId),this.tabTitleRouten.style.display=this.hasRouten?"":"none",this.header.style.display=this.hasAbfahrten||this.hasRouten?"":"none",e&&null==this.routeResultsList?(this.routeResultsList=new((await Promise.all([s.e(653),s.e(918)]).then(s.bind(s,6102))).RouteResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.routeResultsList)):e||null==this.routeResultsList||(this.routeResultsList.remove(),this.routeResultsList=null),e||null!=this.departureResultsList?e&&null!=this.departureResultsList&&(this.departureResultsList.remove(),this.departureResultsList=null):(this.departureResultsList=new((await Promise.all([s.e(653),s.e(274)]).then(s.bind(s,3690))).DepartureResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.departureResultsList))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results",o)},8626:function(e,t,s){"use strict";s(6699),s(3948);class r extends HTMLElement{constructor(){super(),this.popupShown=!1,this.source=this,this.keyListener=this.keyListener.bind(this),this.clickListener=this.clickListener.bind(this)}connectedCallback(){this.updateStyles()}keyListener(e){"Escape"==e.key&&this.hide()}setSource(e){this.source=e}clickListener(e){this.source.contains(e.target)||this.hide()}hide(){this.popupShown&&(document.removeEventListener("keydown",this.keyListener),document.removeEventListener("click",this.clickListener),this.popupShown=!1,this.updateStyles())}show(){this.popupShown||(document.addEventListener("keydown",this.keyListener),document.addEventListener("click",this.clickListener),this.popupShown=!0,this.updateStyles())}updateStyles(){this.style.display=this.popupShown?"":"none"}toggle(){this.popupShown?this.hide():this.show()}disconnectedCallback(){this.hide()}}customElements.define("app-popup",r);var n=s(3277);const i="label";class a extends HTMLElement{constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<button class="search-result-card__button"> <span class="search-result-card__text"></span> </button>',this.rendered=!0,this.text=this.querySelector(".search-result-card__text")),this.updateAttributes()}attributeChangedCallback(){this.updateAttributes()}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(i);this.text.innerText=e}static get observedAttributes(){return[i]}disconnectedCallback(){}}customElements.define("search-result-card",a);const o="label";class l extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<button class="stop-search"> <label class="stop-search__label"></label> <div> <span class="stop-search__selected-result-label">auswählen</span> </div> </button> <app-popup> <div class="stop-search__search"> <div class="stop-search__search-input-container"> <label class="stop-search__label"></label> <input placeholder="Suche eine Station" class="stop-search__search-input" type="search" autocomplete="off" autocapitalize="off"> </div> <div class="stop-search__results"> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> </div> </div> </app-popup>',this.rendered=!0,this.labels=Array.from(this.querySelectorAll(".stop-search__label")),this.button=this.querySelector("button"),this.stopSearchPopup=this.querySelector("app-popup"),this.stopSearchPopup.setSource(this),this.input=this.querySelector(".stop-search__search-input"),this.searchResults=Array.from(this.querySelectorAll(".stop-search__search-result")),this.selectedResultLabel=this.querySelector(".stop-search__selected-result-label")),this.updateAttributes(),(0,n.I)(this.button,"click",(e=>this.onClick(e)),this.abortController.signal);for(let e=0;e<this.searchResults.length;e++)(0,n.I)(this.searchResults[e],"click",(t=>this.onSearchResultClick(e)),this.abortController.signal)}onClick(e){this.stopSearchPopup.show(),this.input.focus()}onSearchResultClick(e){this.dispatchEvent(new CustomEvent("stop-selected",{detail:e})),this.stopSearchPopup.hide()}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[o]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(o);for(let t of this.labels)t.innerText=e;this.button.setAttribute("title","".concat(e," auswählen")),this.labels[1].setAttribute("for","".concat(e,"-search-input")),this.input.setAttribute("id","".concat(e,"-search-input"))}disconnectedCallback(){this.abortController.abort()}get searchTerm(){return this.input.value}setSelected(e){this.selectedResultLabel.innerText=e||"auswählen"}setResults(e){if(this.rendered)for(let t=0;t<this.searchResults.length;t++)t<e.length?(this.searchResults[t].setAttribute("label",e[t].name),this.searchResults[t].style.display=""):this.searchResults[t].style.display="none"}}customElements.define("stop-search",l);var c=s(4657);class u{constructor(){this.type=0}}class h{constructor(e){this.term=e,this.type=1}}class d{constructor(e){this.term=e,this.type=2}}var p=s(8738);class b extends HTMLElement{constructor(){super(),this.appRouter=p.W.getInstance(),this.store=c.y.getInstance(),this.store.postAction(new u)}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div> <stop-search label="Abfahrt" class="route-search__abfahrt" id="departure-stop-search"></stop-search> <stop-search label="Ziel" id="arrival-stop-search"></stop-search> </div>',this.departureStopSearch=this.querySelector("#departure-stop-search"),this.arrivalStopSearch=this.querySelector("#arrival-stop-search"),this.rendered=!0),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),(0,n.I)(this.departureStopSearch,"input",(()=>this.store.postAction(new h(this.departureStopSearch.searchTerm))),this.abortController.signal),(0,n.I)(this.arrivalStopSearch,"input",(()=>this.store.postAction(new d(this.arrivalStopSearch.searchTerm))),this.abortController.signal),(0,n.I)(this.departureStopSearch,"stop-selected",(e=>{var t;this.appRouter.search(this.store.state.departureStopResults[e.detail].id,null===(t=this.store.state.selectedStopgroups.arrival)||void 0===t?void 0:t.id)}),this.abortController.signal),(0,n.I)(this.arrivalStopSearch,"stop-selected",(e=>{var t;this.appRouter.search(null===(t=this.store.state.selectedStopgroups.departure)||void 0===t?void 0:t.id,this.store.state.arrivalStopResults[e.detail].id)}),this.abortController.signal)}update(e,t){var s,r;t.includes("departureStopResults")&&this.departureStopSearch.setResults(e.departureStopResults),t.includes("arrivalStopResults")&&this.arrivalStopSearch.setResults(e.arrivalStopResults),t.includes("selectedStopgroups")&&(this.departureStopSearch.setSelected(null===(s=e.selectedStopgroups.departure)||void 0===s?void 0:s.name),this.arrivalStopSearch.setSelected(null===(r=e.selectedStopgroups.arrival)||void 0===r?void 0:r.name))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-search",b),s(1420),c.y.getInstance().postAction(new class{constructor(){this.type=3}}),p.W.getInstance().router.run()},1420:function(){let e=null;function t(){document.querySelector("#updateready").style.display=""}if(document.querySelector("#update-btn").addEventListener("click",(()=>{e.postMessage({action:"skipWaiting"})})),"serviceWorker"in navigator){window.addEventListener("load",(async()=>{try{let s=await navigator.serviceWorker.register("./sw.js");if(!navigator.serviceWorker.controller)return;let r=s=>{s.addEventListener("statechange",(()=>{"installed"==s.state&&(e=s,t())}))};if(s.waiting)return e=s.waiting,void t();if(s.installing)return void r(s.installing);s.addEventListener("updatefound",(()=>r(s.installing)))}catch(e){console.log("SW registration failed.",e)}}));let s=!1;navigator.serviceWorker.addEventListener("controllerchange",(()=>{s||(s=!0,window.location.reload())}))}},4657:function(e,t,s){"use strict";s.d(t,{y:function(){return r}}),s(3948),s(285),s(1637);class r{constructor(){this._state=null,this.subscriptions=[],this.worker=new Worker(new URL(s.p+s.u(974),s.b)),this.worker.addEventListener("message",(e=>{let[t,s]=e.data;this._state=Object.assign(Object.assign({},this._state),t);for(let e of this.subscriptions)try{e.call(this._state,s)}catch(e){console.error("Error while updating",e)}}))}get state(){return this._state}static getInstance(){return null==this.instance&&(this.instance=new r),this.instance}subscribe(e,t){let s={call:e};this.subscriptions.push(s),t&&t.addEventListener("abort",(()=>{this.subscriptions.splice(this.subscriptions.indexOf(s),1)}))}postAction(e){this.worker.postMessage(e)}}r.instance=null},3277:function(e,t,s){"use strict";function r(e,t,s,r){e.addEventListener(t,s),r.addEventListener("abort",(()=>{e.removeEventListener(t,s)}))}s.d(t,{I:function(){return r}})},8006:function(e,t,s){var r=s(6324),n=s(748).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return r(e,n)}},3948:function(e,t,s){var r=s(7854),n=s(8324),i=s(8509),a=s(6992),o=s(8880),l=s(5112),c=l("iterator"),u=l("toStringTag"),h=a.values,d=function(e,t){if(e){if(e[c]!==h)try{o(e,c,h)}catch(t){e[c]=h}if(e[u]||o(e,u,t),n[t])for(var s in a)if(e[s]!==a[s])try{o(e,s,a[s])}catch(t){e[s]=a[s]}}};for(var p in n)d(r[p]&&r[p].prototype,p);d(i,"DOMTokenList")}},a={};function o(e){var t=a[e];if(void 0!==t)return t.exports;var s=a[e]={exports:{}};return i[e](s,s.exports,o),s.exports}o.m=i,e=[],o.O=function(t,s,r,n){if(!s){var i=1/0;for(u=0;u<e.length;u++){s=e[u][0],r=e[u][1],n=e[u][2];for(var a=!0,l=0;l<s.length;l++)(!1&n||i>=n)&&Object.keys(o.O).every((function(e){return o.O[e](s[l])}))?s.splice(l--,1):(a=!1,n<i&&(i=n));if(a){e.splice(u--,1);var c=r();void 0!==c&&(t=c)}}return t}n=n||0;for(var u=e.length;u>0&&e[u-1][2]>n;u--)e[u]=e[u-1];e[u]=[s,r,n]},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,{a:t}),t},o.d=function(e,t){for(var s in t)o.o(t,s)&&!o.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},o.f={},o.e=function(e){return Promise.all(Object.keys(o.f).reduce((function(t,s){return o.f[s](e,t),t}),[]))},o.u=function(e){return{268:"363ada8b3ecb4e54013d",274:"5e1b34d73afaaabf5e66",653:"a68acab8d184abfcbe3c",918:"5eb546f4f6dcd598196f",974:"68f216d40fcd19085022"}[e]+".bundle.js"},o.miniCssF=function(e){return e+"."+{268:"8c5b220bf6f482881a90",274:"a9d16beee0bb548c5c22",918:"83a38784e6f9d69aa9d0"}[e]+".css"},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t={},s="pockmas:",o.l=function(e,r,n,i){if(t[e])t[e].push(r);else{var a,l;if(void 0!==n)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var h=c[u];if(h.getAttribute("src")==e||h.getAttribute("data-webpack")==s+n){a=h;break}}a||(l=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.setAttribute("data-webpack",s+n),a.src=e),t[e]=[r];var d=function(s,r){a.onerror=a.onload=null,clearTimeout(p);var n=t[e];if(delete t[e],a.parentNode&&a.parentNode.removeChild(a),n&&n.forEach((function(e){return e(r)})),s)return s(r)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=d.bind(null,a.onerror),a.onload=d.bind(null,a.onload),l&&document.head.appendChild(a)}},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.p="/",r=function(e){return new Promise((function(t,s){var r=o.miniCssF(e),n=o.p+r;if(function(e,t){for(var s=document.getElementsByTagName("link"),r=0;r<s.length;r++){var n=(a=s[r]).getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(n===e||n===t))return a}var i=document.getElementsByTagName("style");for(r=0;r<i.length;r++){var a;if((n=(a=i[r]).getAttribute("data-href"))===e||n===t)return a}}(r,n))return t();!function(e,t,s,r){var n=document.createElement("link");n.rel="stylesheet",n.type="text/css",n.onerror=n.onload=function(i){if(n.onerror=n.onload=null,"load"===i.type)s();else{var a=i&&("load"===i.type?"missing":i.type),o=i&&i.target&&i.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+o+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=a,l.request=o,n.parentNode.removeChild(n),r(l)}},n.href=t,document.head.appendChild(n)}(e,n,t,s)}))},n={826:0},o.f.miniCss=function(e,t){n[e]?t.push(n[e]):0!==n[e]&&{268:1,274:1,918:1}[e]&&t.push(n[e]=r(e).then((function(){n[e]=0}),(function(t){throw delete n[e],t})))},function(){o.b=document.baseURI||self.location.href;var e={826:0};o.f.j=function(t,s){var r=o.o(e,t)?e[t]:void 0;if(0!==r)if(r)s.push(r[2]);else{var n=new Promise((function(s,n){r=e[t]=[s,n]}));s.push(r[2]=n);var i=o.p+o.u(t),a=new Error;o.l(i,(function(s){if(o.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var n=s&&("load"===s.type?"missing":s.type),i=s&&s.target&&s.target.src;a.message="Loading chunk "+t+" failed.\n("+n+": "+i+")",a.name="ChunkLoadError",a.type=n,a.request=i,r[1](a)}}),"chunk-"+t,t)}},o.O.j=function(t){return 0===e[t]};var t=function(t,s){var r,n,i=s[0],a=s[1],l=s[2],c=0;if(i.some((function(t){return 0!==e[t]}))){for(r in a)o.o(a,r)&&(o.m[r]=a[r]);if(l)var u=l(o)}for(t&&t(s);c<i.length;c++)n=i[c],o.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return o.O(u)},s=self.webpackChunkpockmas=self.webpackChunkpockmas||[];s.forEach(t.bind(null,0)),s.push=t.bind(null,s.push.bind(s))}();var l=o.O(void 0,[829],(function(){return o(8626)}));l=o.O(l)}();
//# sourceMappingURL=77c9167e25ee056049c0.bundle.js.map