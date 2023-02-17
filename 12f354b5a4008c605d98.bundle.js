!function(){var e,t,s={4488:function(e,t,s){"use strict";s.d(t,{W:function(){return h}});class r{constructor(e,t){this.routeResolver=e,this.routeRenderer=t,this.lastRoute=null,this.popStateListener=this.handlePopState.bind(this)}handlePopState(e){this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}run(){let e=document.querySelector("base");this.basePrefix=e.getAttribute("href"),this.baseHref=e.href,window.addEventListener("popstate",this.popStateListener),this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}destroy(){window.removeEventListener("popstate",this.popStateListener)}resolve(e,t){let s=this.getRoute(e);return Promise.resolve(this.routeResolver.resolve(this.lastRoute,s,this,t)).then((e=>!!e&&{resolved:e,currentRoute:s}))}render(e){return!!e&&(this.routeRenderer.render(e.resolved),this.lastRoute=e.currentRoute,!0)}getRoute(e){let t=e===this.baseHref,s=e.substr(0,this.basePrefix.length)===this.basePrefix;return t?"":s?e.substring(this.basePrefix.length):e}navigate(e,t,s){let r=new URL(e,this.baseHref);this.resolve(r.pathname,r).then((e=>{e&&(s?window.history.replaceState({},t||document.title,r.href):window.history.pushState({},t||document.title,r.href)),this.render(e)}))}}class n{constructor(e){this.itineraryUrlEncoded=e,this.type=6}}var i=s(4657),a=s(2499);class o{constructor(e,t){this.departure=e,this.arrival=t,this.type=4}}const l="dsg",c="asg";class u{constructor(e){this.container=e,this.currentComponent=null}render(e){e&&e!==this.currentComponent&&(this.currentComponent&&(this.container.innerHTML=""),this.container.appendChild(e),this.currentComponent=e)}}class h{static getInstance(){return null==this.instance&&(this.instance=new h),this.instance}setCurrentElement(e){return this.currentElement=e,e}search(e,t){let s=new URLSearchParams;s.set(l,e.toString()),t&&s.set(c,t.toString()),this.router.navigate(`s?${s}`,"pockmas - Suchergebnisse")}constructor(){this.currentElement=null,this.store=i.y.getInstance();let e=this,t=document.querySelector(".content");this.router=new r(new class{parseSearchRoute(e,t){if("s"==e){if(!t.has(l))return null;let e,s=parseInt(t.get(l));return isNaN(s)||t.has(c)&&(e=parseInt(t.get(c)),isNaN(e))?null:{from:s,to:e}}return null}async resolve(t,r,i,l){if(/^r\/(\S+)$/.test(r)){let t=RegExp.$1;e.store.postAction(new n(t));let{RouteDetails:r}=await s.e(148).then(s.bind(s,148));return e.setCurrentElement(new r)}let c=this.parseSearchRoute(r,l.searchParams);if(null!=c){if(e.store.postAction(new o(c.from,c.to)),e.currentElement instanceof a.RouteResults)return e.currentElement;{let{RouteResults:t}=await Promise.resolve().then(s.bind(s,2499));return e.setCurrentElement(new t)}}let{RouteResults:u}=await Promise.resolve().then(s.bind(s,2499));return new u}},new u(t))}}h.instance=null},2499:function(e,t,s){"use strict";s.r(t),s.d(t,{RouteResults:function(){return l}});class r{constructor(e){this.increment=e,this.type=5}}var n,i=s(4657),a=s(3277),o=s(4488);!function(e){e[e.Departures=0]="Departures",e[e.Routes=1]="Routes"}(n||(n={}));class l extends HTMLElement{constructor(){super(),this.rendered=!1,this.displayMode=null,this.store=i.y.getInstance(),this.appRouter=o.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div class="route-results__header" style="display:none"> <a class="route-results__tab-title" id="tab-title-abfahrten"> <h1>Abfahrtsmonitor</h1> </a> <a class="route-results__tab-title" id="tab-title-routen"> <h1>Routen</h1> </a> </div> <div class="button-pane"> <button type="button" class="button" id="add-5-min">5 min später</button> </div>',this.rendered=!0,this.addMinBtn=this.querySelector("#add-5-min"),this.tabTitleAbfahrten=this.querySelector("#tab-title-abfahrten"),this.tabTitleRouten=this.querySelector("#tab-title-routen"),this.header=this.querySelector(".route-results__header"),(0,a.I)(this.addMinBtn,"click",(()=>{this.store.postAction(new r(3e5))}),this.abortController.signal),(0,a.I)(this.tabTitleAbfahrten,"click",(e=>{e.preventDefault(),this.appRouter.search(this.departureStopGroupId,null)}),this.abortController.signal)),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal)}async update(e,t){var s;(t.includes("results")||t.includes("departures"))&&(this.hasAbfahrten=null!=e.departures&&e.departures.length>0,this.hasRouten=null!=e.results&&e.results.length>0,this.render()),t.includes("selectedStopgroups")&&(this.departureStopGroupId=null===(s=e.selectedStopgroups.departure)||void 0===s?void 0:s.id)}async render(){let e=this.hasRouten;this.tabTitleAbfahrten.classList.toggle("route-results__tab-title--disabled",e),this.tabTitleRouten.classList.toggle("route-results__tab-title--disabled",!e),this.tabTitleAbfahrten.style.display=this.departureStopGroupId?"":"none",this.tabTitleAbfahrten.href=`s?dsg=${this.departureStopGroupId}`,this.tabTitleRouten.style.display=this.hasRouten?"":"none",this.header.style.display=this.hasAbfahrten||this.hasRouten?"":"none",e&&this.displayMode!=n.Routes?(this.displayMode=n.Routes,this.routeResultsList=new((await s.e(102).then(s.bind(s,6102))).RouteResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.routeResultsList)):e||null==this.routeResultsList||(this.routeResultsList.remove(),this.routeResultsList=null),e||this.displayMode==n.Departures?e&&null!=this.departureResultsList&&(this.departureResultsList.remove(),this.departureResultsList=null):(this.displayMode=n.Departures,this.departureResultsList=new((await s.e(690).then(s.bind(s,3690))).DepartureResultsList),this.querySelector(".button-pane").insertAdjacentElement("beforebegin",this.departureResultsList))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results",l)},1420:function(){let e=null;function t(){document.querySelector("#updateready").style.display=""}if(document.querySelector("#update-btn").addEventListener("click",(()=>{e.postMessage({action:"skipWaiting"})})),"serviceWorker"in navigator){window.addEventListener("load",(async()=>{try{let s=await navigator.serviceWorker.register("./sw.js");if(!navigator.serviceWorker.controller)return;let r=s=>{s.addEventListener("statechange",(()=>{"installed"==s.state&&(e=s,t())}))};if(s.waiting)return e=s.waiting,void t();if(s.installing)return void r(s.installing);s.addEventListener("updatefound",(()=>r(s.installing)))}catch(e){console.log("SW registration failed.",e)}}));let s=!1;navigator.serviceWorker.addEventListener("controllerchange",(()=>{s||(s=!0,window.location.reload())}))}},4657:function(e,t,s){"use strict";s.d(t,{y:function(){return r}});class r{get state(){return this._state}static getInstance(){return null==this.instance&&(this.instance=new r),this.instance}constructor(){this._state=null,this.subscriptions=[],this.worker=new Worker(new URL(s.p+s.u(468),s.b)),this.worker.addEventListener("message",(e=>{let[t,s]=e.data;this._state=Object.assign(Object.assign({},this._state),t);for(let e of this.subscriptions)try{e.call(this._state,s)}catch(e){console.error("Error while updating",e)}}))}subscribe(e,t){let s={call:e};this.subscriptions.push(s),t&&t.addEventListener("abort",(()=>{this.subscriptions.splice(this.subscriptions.indexOf(s),1)}))}postAction(e){this.worker.postMessage(e)}}r.instance=null},3277:function(e,t,s){"use strict";function r(e,t,s,r){e.addEventListener(t,s),r.addEventListener("abort",(()=>{e.removeEventListener(t,s)}))}s.d(t,{I:function(){return r}})}},r={};function n(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={id:e,exports:{}};return s[e](i,i.exports,n),i.exports}n.m=s,n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,{a:t}),t},n.d=function(e,t){for(var s in t)n.o(t,s)&&!n.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,s){return n.f[s](e,t),t}),[]))},n.u=function(e){return{102:"cf2ba67cb39b9f196a8e",148:"d13341cea26bfc220f1e",468:"07b3c6dcc5dcee8490e5",690:"94c5517983b78c1dbf18"}[e]+".bundle.js"},n.miniCssF=function(e){return e+"."+{102:"49b5db72ec40d16bec59",148:"a1312c6487cfa5e4a385",690:"6814388e82313c206c94"}[e]+".css"},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},e={},t="pockmas:",n.l=function(s,r,i,a){if(e[s])e[s].push(r);else{var o,l;if(void 0!==i)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var h=c[u];if(h.getAttribute("src")==s||h.getAttribute("data-webpack")==t+i){o=h;break}}o||(l=!0,(o=document.createElement("script")).charset="utf-8",o.timeout=120,n.nc&&o.setAttribute("nonce",n.nc),o.setAttribute("data-webpack",t+i),o.src=s),e[s]=[r];var d=function(t,r){o.onerror=o.onload=null,clearTimeout(p);var n=e[s];if(delete e[s],o.parentNode&&o.parentNode.removeChild(o),n&&n.forEach((function(e){return e(r)})),t)return t(r)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:o}),12e4);o.onerror=d.bind(null,o.onerror),o.onload=d.bind(null,o.onload),l&&document.head.appendChild(o)}},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.p="/",function(){if("undefined"!=typeof document){var e={826:0};n.f.miniCss=function(t,s){e[t]?s.push(e[t]):0!==e[t]&&{102:1,148:1,690:1}[t]&&s.push(e[t]=function(e){return new Promise((function(t,s){var r=n.miniCssF(e),i=n.p+r;if(function(e,t){for(var s=document.getElementsByTagName("link"),r=0;r<s.length;r++){var n=(a=s[r]).getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(n===e||n===t))return a}var i=document.getElementsByTagName("style");for(r=0;r<i.length;r++){var a;if((n=(a=i[r]).getAttribute("data-href"))===e||n===t)return a}}(r,i))return t();!function(e,t,s,r,n){var i=document.createElement("link");i.rel="stylesheet",i.type="text/css",i.onerror=i.onload=function(s){if(i.onerror=i.onload=null,"load"===s.type)r();else{var a=s&&("load"===s.type?"missing":s.type),o=s&&s.target&&s.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+o+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=a,l.request=o,i.parentNode.removeChild(i),n(l)}},i.href=t,document.head.appendChild(i)}(e,i,0,t,s)}))}(t).then((function(){e[t]=0}),(function(s){throw delete e[t],s})))}}}(),function(){n.b=document.baseURI||self.location.href;var e={826:0};n.f.j=function(t,s){var r=n.o(e,t)?e[t]:void 0;if(0!==r)if(r)s.push(r[2]);else{var i=new Promise((function(s,n){r=e[t]=[s,n]}));s.push(r[2]=i);var a=n.p+n.u(t),o=new Error;n.l(a,(function(s){if(n.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var i=s&&("load"===s.type?"missing":s.type),a=s&&s.target&&s.target.src;o.message="Loading chunk "+t+" failed.\n("+i+": "+a+")",o.name="ChunkLoadError",o.type=i,o.request=a,r[1](o)}}),"chunk-"+t,t)}};var t=function(t,s){var r,i,a=s[0],o=s[1],l=s[2],c=0;if(a.some((function(t){return 0!==e[t]}))){for(r in o)n.o(o,r)&&(n.m[r]=o[r]);l&&l(n)}for(t&&t(s);c<a.length;c++)i=a[c],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0},s=self.webpackChunkpockmas=self.webpackChunkpockmas||[];s.forEach(t.bind(null,0)),s.push=t.bind(null,s.push.bind(s))}(),function(){"use strict";class e extends HTMLElement{constructor(){super(),this.popupShown=!1,this.source=this,this.keyListener=this.keyListener.bind(this),this.clickListener=this.clickListener.bind(this)}connectedCallback(){this.updateStyles()}keyListener(e){"Escape"==e.key&&this.hide()}setSource(e){this.source=e}clickListener(e){this.source.contains(e.target)||this.hide()}hide(){this.popupShown&&(document.removeEventListener("keydown",this.keyListener),document.removeEventListener("click",this.clickListener),this.popupShown=!1,this.updateStyles())}show(){this.popupShown||(document.addEventListener("keydown",this.keyListener),document.addEventListener("click",this.clickListener),this.popupShown=!0,this.updateStyles())}updateStyles(){this.style.display=this.popupShown?"":"none"}toggle(){this.popupShown?this.hide():this.show()}disconnectedCallback(){this.hide()}}customElements.define("app-popup",e);var t=n(3277);const s="label";class r extends HTMLElement{constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<button class="search-result-card__button"> <span class="search-result-card__text"></span> </button>',this.rendered=!0,this.text=this.querySelector(".search-result-card__text")),this.updateAttributes()}attributeChangedCallback(){this.updateAttributes()}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(s);this.text.innerText=e}static get observedAttributes(){return[s]}disconnectedCallback(){}}customElements.define("search-result-card",r);const i="label";class a extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<button class="stop-search"> <label class="stop-search__label"></label> <div> <span class="stop-search__selected-result-label">auswählen</span> </div> </button> <app-popup> <div class="stop-search__search"> <div class="stop-search__search-input-container"> <label class="stop-search__label"></label> <input placeholder="Suche eine Station" class="stop-search__search-input" type="search" autocomplete="off" autocapitalize="off"> </div> <div class="stop-search__results"> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> </div> </div> </app-popup>',this.rendered=!0,this.labels=Array.from(this.querySelectorAll(".stop-search__label")),this.button=this.querySelector("button"),this.stopSearchPopup=this.querySelector("app-popup"),this.stopSearchPopup.setSource(this),this.input=this.querySelector(".stop-search__search-input"),this.searchResults=Array.from(this.querySelectorAll(".stop-search__search-result")),this.selectedResultLabel=this.querySelector(".stop-search__selected-result-label")),this.updateAttributes(),(0,t.I)(this.button,"click",(e=>this.onClick(e)),this.abortController.signal);for(let e=0;e<this.searchResults.length;e++)(0,t.I)(this.searchResults[e],"click",(t=>this.onSearchResultClick(e)),this.abortController.signal)}onClick(e){this.stopSearchPopup.show(),this.input.focus()}onSearchResultClick(e){this.dispatchEvent(new CustomEvent("stop-selected",{detail:e})),this.stopSearchPopup.hide()}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[i]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(i);for(let t of this.labels)t.innerText=e;this.button.setAttribute("title",`${e} auswählen`),this.labels[1].setAttribute("for",`${e}-search-input`),this.input.setAttribute("id",`${e}-search-input`)}disconnectedCallback(){this.abortController.abort()}get searchTerm(){return this.input.value}setSelected(e){this.selectedResultLabel.innerText=e||"auswählen"}setResults(e){if(this.rendered)for(let t=0;t<this.searchResults.length;t++)t<e.length?(this.searchResults[t].setAttribute("label",e[t].name),this.searchResults[t].style.display=""):this.searchResults[t].style.display="none"}}customElements.define("stop-search",a);var o=n(4657);class l{constructor(){this.type=0}}class c{constructor(e){this.term=e,this.type=1}}class u{constructor(e){this.term=e,this.type=2}}var h=n(4488);class d extends HTMLElement{constructor(){super(),this.appRouter=h.W.getInstance(),this.store=o.y.getInstance(),this.store.postAction(new l)}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div> <stop-search label="Abfahrt" class="route-search__abfahrt" id="departure-stop-search"></stop-search> <stop-search label="Ziel" id="arrival-stop-search"></stop-search> </div>',this.departureStopSearch=this.querySelector("#departure-stop-search"),this.arrivalStopSearch=this.querySelector("#arrival-stop-search"),this.rendered=!0),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),(0,t.I)(this.departureStopSearch,"input",(()=>this.store.postAction(new c(this.departureStopSearch.searchTerm))),this.abortController.signal),(0,t.I)(this.arrivalStopSearch,"input",(()=>this.store.postAction(new u(this.arrivalStopSearch.searchTerm))),this.abortController.signal),(0,t.I)(this.departureStopSearch,"stop-selected",(e=>{var t;this.appRouter.search(this.store.state.departureStopResults[e.detail].id,null===(t=this.store.state.selectedStopgroups.arrival)||void 0===t?void 0:t.id)}),this.abortController.signal),(0,t.I)(this.arrivalStopSearch,"stop-selected",(e=>{var t;this.appRouter.search(null===(t=this.store.state.selectedStopgroups.departure)||void 0===t?void 0:t.id,this.store.state.arrivalStopResults[e.detail].id)}),this.abortController.signal)}update(e,t){var s,r;t.includes("departureStopResults")&&this.departureStopSearch.setResults(e.departureStopResults),t.includes("arrivalStopResults")&&this.arrivalStopSearch.setResults(e.arrivalStopResults),t.includes("selectedStopgroups")&&(this.departureStopSearch.setSelected(null===(s=e.selectedStopgroups.departure)||void 0===s?void 0:s.name),this.arrivalStopSearch.setSelected(null===(r=e.selectedStopgroups.arrival)||void 0===r?void 0:r.name))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-search",d),n(1420),o.y.getInstance().postAction(new class{constructor(){this.type=3}}),h.W.getInstance().router.run()}()}();
//# sourceMappingURL=12f354b5a4008c605d98.bundle.js.map