!function(){var e,t,s,r,i,n={542:function(e){"use strict";e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),t.hash&&(e+=t.hash),t.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(e)?'"'.concat(e,'"'):e):e}},8738:function(e,t,s){"use strict";s.d(t,{W:function(){return h}}),s(3948),s(1637),s(285);class r{constructor(e,t){this.routeResolver=e,this.routeRenderer=t,this.lastRoute=null,this.popStateListener=this.handlePopState.bind(this)}handlePopState(e){this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}run(){let e=document.querySelector("base");this.basePrefix=e.getAttribute("href"),this.baseHref=e.href,window.addEventListener("popstate",this.popStateListener),this.resolve(window.location.pathname,{searchParams:new URLSearchParams(window.location.search)}).then((e=>this.render(e)))}destroy(){window.removeEventListener("popstate",this.popStateListener)}resolve(e,t){let s=this.getRoute(e);return Promise.resolve(this.routeResolver.resolve(this.lastRoute,s,this,t)).then((e=>!!e&&{resolved:e,currentRoute:s}))}render(e){return!!e&&(this.routeRenderer.render(e.resolved),this.lastRoute=e.currentRoute,!0)}getRoute(e){let t=e===this.baseHref,s=e.substr(0,this.basePrefix.length)===this.basePrefix;return t?"":s?e.substring(this.basePrefix.length):e}navigate(e,t,s){let r=new URL(e,this.baseHref);this.resolve(r.pathname,r).then((e=>{e&&(s?window.history.replaceState({},t||document.title,r.href):window.history.pushState({},t||document.title,r.href)),this.render(e)}))}}class i{constructor(e){this.itineraryUrlEncoded=e,this.type=6}}var n=s(4657),a=s(3097);class o{constructor(e,t){this.departure=e,this.arrival=t,this.type=4}}const l="dsg",c="asg";class u{constructor(e){this.container=e,this.currentComponent=null}render(e){e&&e!==this.currentComponent&&(this.currentComponent&&(this.container.innerHTML=""),this.container.appendChild(e),this.currentComponent=e)}}class h{constructor(){this.currentElement=null,this.store=n.y.getInstance();let e=this,t=document.querySelector(".content");this.router=new r(new class{parseSearchRoute(e,t){if("s"==e){if(!t.has(l)||!t.has(c))return null;let e=parseInt(t.get(l)),s=parseInt(t.get(c));return isNaN(e)||isNaN(s)?null:{from:e,to:s}}return null}async resolve(t,r,n,l){if(/^r\/(\S+)$/.test(r)){let t=RegExp.$1;e.store.postAction(new i(t));let{RouteDetails:r}=await s.e(268).then(s.bind(s,5268));return e.setCurrentElement(new r)}let c=this.parseSearchRoute(r,l.searchParams);if(null!=c){if(e.store.postAction(new o(c.from,c.to)),e.currentElement instanceof a.RouteResults)return e.currentElement;{let{RouteResults:t}=await Promise.resolve().then(s.bind(s,3097));return e.setCurrentElement(new t)}}let{RouteResults:u}=await Promise.resolve().then(s.bind(s,3097));return new u}},new u(t))}static getInstance(){return null==this.instance&&(this.instance=new h),this.instance}setCurrentElement(e){return this.currentElement=e,e}search(e,t){this.router.navigate("s?".concat(l,"=").concat(e,"&").concat(c,"=").concat(t),"pockmas - Suchergebnisse",this.currentElement instanceof a.RouteResults)}}h.instance=null},3097:function(e,t,s){"use strict";s.r(t),s.d(t,{RouteResults:function(){return T}});class r{constructor(e){this.increment=e,this.type=5}}var i=s(4657),n=s(3277);s(3948);class a{constructor(e,t,s){this.listElement=e,this.keySelector=t,this.createElement=s,this.keyToElement=new Map,this.elementToKey=new WeakMap}update(e,t){let s=new Map,r=e=>s.get(e)||(()=>{let t=this.keySelector(e);return s.set(e,t),t})();for(let s of Array.from(this.listElement.children)){let i=s,n=e.find((e=>this.elementToKey.get(i)==r(e)));n?t(i,n):this.listElement.removeChild(i)}let i=null,n=new Map;for(let s of e){let e=r(s),a=this.keyToElement.get(e);a||(a=this.createElement(s),t(a,s),this.elementToKey.set(a,e)),n.set(e,a),null==i&&a!=this.listElement.firstElementChild?this.listElement.prepend(a):null!=i&&i.nextElementSibling!=a&&i.insertAdjacentElement("afterend",a),i=a}this.keyToElement=n}}const o="route",l="route-color";class c extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<span class="transit-display__route"></span>',this.rendered=!0,this.routeLabel=this.querySelector(".transit-display__route"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[o,l]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(o);this.routeLabel.innerText=e;let t=this.getAttribute(l);this.style.backgroundColor=t?"#".concat(t):""}disconnectedCallback(){}}const u="transit-display";customElements.define(u,c);var h=s(542),d=s.n(h),p=new URL(s(2988),s.b),m='<img class="walking-display__img" src="'+d()(p)+'" alt="gehende Person"> <span class="walking-display__minutes"></span>';const b="minutes";class f extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML=m,this.rendered=!0,this.minutesLabel=this.querySelector(".walking-display__minutes"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[b]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(b);this.minutesLabel.innerText="".concat(e,"'")}disconnectedCallback(){}}const y="walking-display";customElements.define(y,f);const g=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class v extends HTMLElement{constructor(){super(),this.rendered=!1,this.timelineElements=[]}connectedCallback(){this.rendered||(this.rendered=!0,this.innerHTML='<ol class="route-timeline"> <li class="route-timeline__time route-timeline__departure-time"></li> <li class="route-timeline__time route-timeline__arrival-time"></li> </ol>',this.departureTimeLabel=this.querySelector(".route-timeline__departure-time"),this.arrivalTimeLabel=this.querySelector(".route-timeline__arrival-time")),this.render()}disconnectedCallback(){}reuseOrCreateElement(e,t){let s,r=e.find((e=>0===e.children[0].tagName.localeCompare(t,void 0,{sensitivity:"accent"})));return r?(e.splice(e.indexOf(r),1),s=r.children[0]):(r=document.createElement("li"),s=document.createElement(t),r.appendChild(s)),0==this.timelineElements.length?this.departureTimeLabel.insertAdjacentElement("afterend",r):this.timelineElements[this.timelineElements.length-1].insertAdjacentElement("afterend",r),this.timelineElements.push(r),s}addWalkingLeg(e,t){this.reuseOrCreateElement(t,y).setAttribute(b,"".concat(Math.ceil(e/6e4)))}addTransportLeg(e,t){let s=this.reuseOrCreateElement(t,u);s.setAttribute(o,e.route.name),s.setAttribute(l,e.route.color)}update(e){this.itinerary=e,this.render()}render(){if(!this.rendered||!this.itinerary||0===this.itinerary.legs.length)return;let e=g.format(new Date(this.itinerary.legs[0].plannedDeparture.getTime()+1e3*this.itinerary.legs[0].delay));this.departureTimeLabel.title="Losgehen um ".concat(e),this.departureTimeLabel.innerText=e;let t=g.format(this.itinerary.legs[this.itinerary.legs.length-1].arrivalTime);this.arrivalTimeLabel.title="Ankunft um ".concat(t),this.arrivalTimeLabel.innerText=t;let s=this.timelineElements;this.timelineElements=[];let r=0;for(let e=0;e<this.itinerary.legs.length;e++){let t=this.itinerary.legs[e];switch(t.type){case 0:r+=t.duration;let i=e<this.itinerary.legs.length-1?this.itinerary.legs[e+1]:null;i&&0==i.type||((0==e||e==this.itinerary.legs.length-1||r>12e4)&&this.addWalkingLeg(r,s),r=0);break;case 1:this.addTransportLeg(t,s)}}for(let e of this.itinerary.legs);for(let e of s)e.remove()}}customElements.define("route-timeline",v);const S="text";class k extends HTMLElement{constructor(){super(),this.isFront=!0,this.beforeValue=null,this.animating=!1,this.connected=!1,this.queuedValue=null;let e=this.attachShadow({mode:"open"});e.innerHTML='<style>.box{perspective:5em;display:inline-block}.box-inner{transform-style:preserve-3d;display:inline-block;position:relative;border-radius:2px;transition:transform,box-shadow;animation-timing-function:ease-in-out}.back,.front{backface-visibility:hidden;display:inline-block;position:absolute;left:0}.front{transform:rotateX(0)}.back{transform:rotateX(180deg)}.actual{visibility:hidden}.show-back{animation:flip-front-to-back .8s;transform:rotateX(180deg)}.show-front{animation:flip-back-to-front .8s;transform:rotateX(0)}@keyframes flip-back-to-front{0%{transform:rotateX(180deg);box-shadow:none}10%{transform:rotateX(180deg)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(360deg)}100%{transform:rotateX(360deg);box-shadow:none}}@keyframes flip-front-to-back{0%{transform:rotateX(0);box-shadow:none}10%{transform:rotateX(0)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(180deg)}100%{transform:rotateX(180deg);box-shadow:none}}</style><span class="box"><span class="box-inner"><span class="front" aria-hidden="true"></span><span class="back" aria-hidden="true"></span><span class="actual"></span></span></span>',this.frontSpan=e.querySelector(".front"),this.backSpan=e.querySelector(".back"),this.boxInner=e.querySelector(".box-inner"),this.actualSpan=e.querySelector(".actual"),this.listener=()=>this.animationEnded()}connectedCallback(){this.connected=!0,this.boxInner.addEventListener("animationend",this.listener)}animationEnded(){this.animating=!1,this.queuedValue&&(this.updateAttributes(),this.queuedValue=null)}disconnectedCallback(){this.connected=!1,this.boxInner.removeEventListener("animationend",this.listener)}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[S]}updateAttributes(){let e=this.getAttribute(S);this.beforeValue?e!==this.beforeValue&&(this.animating?this.queuedValue=e:(this.isFront=!this.isFront,this.isFront?(this.frontSpan.innerText=e,this.boxInner.classList.remove("show-back"),this.boxInner.classList.add("show-front")):(this.backSpan.innerText=e,this.boxInner.classList.remove("show-front"),this.boxInner.classList.add("show-back")),this.connected&&(this.animating=!0),this.actualSpan.innerText=e,this.beforeValue=e)):(this.isFront=!0,this.frontSpan.innerText=e,this.backSpan.innerText="",this.boxInner.classList.remove("show-back"),this.boxInner.classList.remove("show-front"),this.beforeValue=e,this.actualSpan.innerText=e)}}customElements.define("flip-display",k);const w="time";class _ extends HTMLElement{constructor(){super();let e=this.attachShadow({mode:"open"});e.innerHTML="<flip-display></flip-display><flip-display></flip-display>:<flip-display></flip-display><flip-display></flip-display>",this.digits=Array.from(e.querySelectorAll("flip-display"))}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[w]}updateAttributes(){let e=this.getAttribute(w),t=new Date(parseInt(e)),s=t.getHours(),r=t.getMinutes();this.digits[0].setAttribute(S,(s/10>>0).toString()),this.digits[1].setAttribute(S,(s%10).toString()),this.digits[2].setAttribute(S,(r/10>>0).toString()),this.digits[3].setAttribute(S,(r%10).toString())}}customElements.define("flip-time-display",_);var E=s(8738);const C=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class L extends HTMLElement{constructor(){super(),this.rendered=!1,this.router=E.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<a title="Details zur Route anzeigen"> <div class="route-summary__departure"> <flip-time-display class="route-summary__departure-time"></flip-time-display> <div> <transit-display class="route-summary__departure-line"></transit-display> </div> <span class="route-summary__departure-stop"></span> <span class="route-summary__planned-time"></span> <span class="route-summary__departure-direction">Richtung <span class="route-summary__departure-headsign"></span> </span> </div> <route-timeline class="route-summary__timeline"></route-timeline> </a>',this.rendered=!0,this.departureTime=this.querySelector(".route-summary__departure-time"),this.plannedTime=this.querySelector(".route-summary__planned-time"),this.departureLine=this.querySelector(".route-summary__departure-line"),this.departureStop=this.querySelector(".route-summary__departure-stop"),this.departureHeadsign=this.querySelector(".route-summary__departure-headsign"),this.timeLine=this.querySelector(".route-summary__timeline"),this.link=this.querySelector("a"),(0,n.I)(this.link,"click",(e=>{e.preventDefault(),this.router.router.navigate("r/".concat(this.itinerary.itineraryUrlEncoded),"pockmas - Route")}),this.abortController.signal)),this.render()}render(){if(this.rendered&&this.itinerary.itinerary.legs.length>0){let e=this.itinerary.itinerary.legs.find((e=>1==e.type));if(e){let t=new Date(e.plannedDeparture.getTime()+1e3*e.delay),s=C.format(t);this.departureTime.setAttribute("time",""+t.getTime()),this.departureTime.setAttribute("title","Abfahrt um ".concat(s));let r=C.format(e.plannedDeparture),i=r!=s;this.plannedTime.innerText="".concat(e.isRealtime?i?r:"pünktlich":""),this.plannedTime.style.textDecoration=i?"line-through":"none",this.departureLine.setAttribute(o,e.route.name),this.departureLine.setAttribute(l,e.route.color),this.departureStop.innerText=e.departureStop.stopName,this.departureHeadsign.innerText=e.route.headsign,this.link.href="r/".concat(this.itinerary.itineraryUrlEncoded),this.timeLine.update(this.itinerary.itinerary)}}}update(e){this.itinerary=e,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-summary",L);class A extends HTMLElement{constructor(){super(),this.rendered=!1,this.itineraries=[],this.store=i.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="",this.rendered=!0,this.renderer=new a(this,(e=>this.itineraries.indexOf(e)),(e=>new L))),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),this.init(this.store.state)}setResults(e){e.results&&(this.itineraries=e.results,this.renderer.update(this.itineraries,((e,t)=>{e.update(t)})))}update(e,t){t.includes("results")&&this.setResults(e)}init(e){this.setResults(e)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results-list",A);class T extends HTMLElement{constructor(){super(),this.rendered=!1,this.store=i.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<route-results-list></route-results-list> <div class="button-pane"> <button type="button" class="button" id="add-5-min">5 min später</button> </div>',this.rendered=!0,(0,n.I)(this.querySelector("#add-5-min"),"click",(()=>{this.store.postAction(new r(3e5))}),this.abortController.signal))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results",T)},8626:function(e,t,s){"use strict";s(3948);class r extends HTMLElement{constructor(){super(),this.popupShown=!1,this.source=this,this.keyListener=this.keyListener.bind(this),this.clickListener=this.clickListener.bind(this)}connectedCallback(){this.updateStyles()}keyListener(e){"Escape"==e.key&&this.hide()}setSource(e){this.source=e}clickListener(e){this.source.contains(e.target)||this.hide()}hide(){this.popupShown&&(document.removeEventListener("keydown",this.keyListener),document.removeEventListener("click",this.clickListener),this.popupShown=!1,this.updateStyles())}show(){this.popupShown||(document.addEventListener("keydown",this.keyListener),document.addEventListener("click",this.clickListener),this.popupShown=!0,this.updateStyles())}updateStyles(){this.style.display=this.popupShown?"":"none"}toggle(){this.popupShown?this.hide():this.show()}disconnectedCallback(){this.hide()}}customElements.define("app-popup",r);var i=s(3277);const n="label";class a extends HTMLElement{constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<button class="search-result-card__button"> <span class="search-result-card__text"></span> </button>',this.rendered=!0,this.text=this.querySelector(".search-result-card__text")),this.updateAttributes()}attributeChangedCallback(){this.updateAttributes()}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(n);this.text.innerText=e}static get observedAttributes(){return[n]}disconnectedCallback(){}}customElements.define("search-result-card",a);const o="label";class l extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<button class="stop-search"> <label class="stop-search__label"></label> <div> <span class="stop-search__selected-result-label">auswählen</span> </div> </button> <app-popup> <div class="stop-search__search"> <div class="stop-search__search-input-container"> <label class="stop-search__label"></label> <input placeholder="Suche eine Station" class="stop-search__search-input" type="search" autocomplete="off" autocapitalize="off"> </div> <div class="stop-search__results"> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> </div> </div> </app-popup>',this.rendered=!0,this.labels=Array.from(this.querySelectorAll(".stop-search__label")),this.button=this.querySelector("button"),this.popup=this.querySelector("app-popup"),this.popup.setSource(this),this.input=this.querySelector(".stop-search__search-input"),this.searchResults=Array.from(this.querySelectorAll(".stop-search__search-result")),this.selectedResultLabel=this.querySelector(".stop-search__selected-result-label")),this.updateAttributes(),(0,i.I)(this.button,"click",(e=>this.onClick(e)),this.abortController.signal);for(let e=0;e<this.searchResults.length;e++)(0,i.I)(this.searchResults[e],"click",(t=>this.onSearchResultClick(e)),this.abortController.signal)}onClick(e){this.popup.show(),this.input.focus()}onSearchResultClick(e){this.selectedResultLabel.innerText=this.searchResults[e].getAttribute("label"),this.dispatchEvent(new CustomEvent("stop-selected",{detail:e})),this.popup.hide()}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[o]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(o);for(let t of this.labels)t.innerText=e;this.button.setAttribute("title","".concat(e," auswählen")),this.labels[1].setAttribute("for","".concat(e,"-search-input")),this.input.setAttribute("id","".concat(e,"-search-input"))}disconnectedCallback(){this.abortController.abort()}get searchTerm(){return this.input.value}setSelected(e){this.selectedResultLabel.innerText=e}setResults(e){if(this.rendered)for(let t=0;t<this.searchResults.length;t++)t<e.length?(this.searchResults[t].setAttribute("label",e[t].name),this.searchResults[t].style.display=""):this.searchResults[t].style.display="none"}}customElements.define("stop-search",l);var c=s(4657);class u{constructor(){this.type=0}}class h{constructor(e){this.term=e,this.type=1}}class d{constructor(e){this.term=e,this.type=2}}var p=s(8738);class m extends HTMLElement{constructor(){super(),this.appRouter=p.W.getInstance(),this.store=c.y.getInstance(),this.store.postAction(new u)}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div> <stop-search label="Abfahrt" class="route-search__abfahrt" id="departure-stop-search"></stop-search> <stop-search label="Ziel" id="arrival-stop-search"></stop-search> </div>',this.departureStopSearch=this.querySelector("#departure-stop-search"),this.arrivalStopSearch=this.querySelector("#arrival-stop-search"),this.rendered=!0),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),(0,i.I)(this.departureStopSearch,"input",(()=>this.store.postAction(new h(this.departureStopSearch.searchTerm))),this.abortController.signal),(0,i.I)(this.arrivalStopSearch,"input",(()=>this.store.postAction(new d(this.arrivalStopSearch.searchTerm))),this.abortController.signal),(0,i.I)(this.departureStopSearch,"stop-selected",(e=>{this.selectedDepartureStop=e.detail,this.onStopsSelected()}),this.abortController.signal),(0,i.I)(this.arrivalStopSearch,"stop-selected",(e=>{this.selectedArrivalStop=e.detail,this.onStopsSelected()}),this.abortController.signal)}update(e,t){t.includes("departureStopResults")&&this.departureStopSearch.setResults(e.departureStopResults),t.includes("arrivalStopResults")&&this.arrivalStopSearch.setResults(e.arrivalStopResults),t.includes("routeDetail")&&e.routeDetail&&(this.departureStopSearch.setSelected(e.routeDetail.itinerary.legs[0].departureStop.stopName),this.arrivalStopSearch.setSelected(e.routeDetail.itinerary.legs[e.routeDetail.itinerary.legs.length-1].arrivalStop.stopName))}onStopsSelected(){null!=this.selectedDepartureStop&&null!=this.selectedArrivalStop&&this.appRouter.search(this.store.state.departureStopResults[this.selectedDepartureStop].id,this.store.state.arrivalStopResults[this.selectedArrivalStop].id)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-search",m),s(1420),c.y.getInstance().postAction(new class{constructor(){this.type=3}}),p.W.getInstance().router.run()},1420:function(){let e=null;function t(){document.querySelector("#updateready").style.display=""}if(document.querySelector("#update-btn").addEventListener("click",(()=>{e.postMessage({action:"skipWaiting"})})),"serviceWorker"in navigator){window.addEventListener("load",(async()=>{try{let s=await navigator.serviceWorker.register("./sw.js");if(!navigator.serviceWorker.controller)return;let r=s=>{s.addEventListener("statechange",(()=>{"installed"==s.state&&(e=s,t())}))};if(s.waiting)return e=s.waiting,void t();if(s.installing)return void r(s.installing);s.addEventListener("updatefound",(()=>r(s.installing)))}catch(e){console.log("SW registration failed.",e)}}));let s=!1;navigator.serviceWorker.addEventListener("controllerchange",(()=>{s||(s=!0,window.location.reload())}))}},4657:function(e,t,s){"use strict";s.d(t,{y:function(){return r}}),s(3948),s(285),s(1637);class r{constructor(){this._state=null,this.subscriptions=[],this.worker=new Worker(new URL(s.p+s.u(976),s.b)),this.worker.addEventListener("message",(e=>{let[t,s]=e.data;this._state=Object.assign(Object.assign({},this._state),t);for(let e of this.subscriptions)try{e.call(this._state,s)}catch(e){console.error("Error while updating",e)}}))}get state(){return this._state}static getInstance(){return null==this.instance&&(this.instance=new r),this.instance}subscribe(e,t){let s={call:e};this.subscriptions.push(s),t&&t.addEventListener("abort",(()=>{this.subscriptions.splice(this.subscriptions.indexOf(s),1)}))}postAction(e){this.worker.postMessage(e)}}r.instance=null},3277:function(e,t,s){"use strict";function r(e,t,s,r){e.addEventListener(t,s),r.addEventListener("abort",(()=>{e.removeEventListener(t,s)}))}s.d(t,{I:function(){return r}})},8006:function(e,t,s){var r=s(6324),i=s(748).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return r(e,i)}},2988:function(e,t,s){"use strict";e.exports=s.p+"355f516c704b4163eba7.svg"}},a={};function o(e){var t=a[e];if(void 0!==t)return t.exports;var s=a[e]={exports:{}};return n[e](s,s.exports,o),s.exports}o.m=n,e=[],o.O=function(t,s,r,i){if(!s){var n=1/0;for(u=0;u<e.length;u++){s=e[u][0],r=e[u][1],i=e[u][2];for(var a=!0,l=0;l<s.length;l++)(!1&i||n>=i)&&Object.keys(o.O).every((function(e){return o.O[e](s[l])}))?s.splice(l--,1):(a=!1,i<n&&(n=i));if(a){e.splice(u--,1);var c=r();void 0!==c&&(t=c)}}return t}i=i||0;for(var u=e.length;u>0&&e[u-1][2]>i;u--)e[u]=e[u-1];e[u]=[s,r,i]},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,{a:t}),t},o.d=function(e,t){for(var s in t)o.o(t,s)&&!o.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},o.f={},o.e=function(e){return Promise.all(Object.keys(o.f).reduce((function(t,s){return o.f[s](e,t),t}),[]))},o.u=function(e){return{268:"1d19c1f98d6e25fe54d3",976:"953c3c133581b4f55f88"}[e]+".bundle.js"},o.miniCssF=function(e){return e+".8c5b220bf6f482881a90.css"},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t={},s="pockmas:",o.l=function(e,r,i,n){if(t[e])t[e].push(r);else{var a,l;if(void 0!==i)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var h=c[u];if(h.getAttribute("src")==e||h.getAttribute("data-webpack")==s+i){a=h;break}}a||(l=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,o.nc&&a.setAttribute("nonce",o.nc),a.setAttribute("data-webpack",s+i),a.src=e),t[e]=[r];var d=function(s,r){a.onerror=a.onload=null,clearTimeout(p);var i=t[e];if(delete t[e],a.parentNode&&a.parentNode.removeChild(a),i&&i.forEach((function(e){return e(r)})),s)return s(r)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=d.bind(null,a.onerror),a.onload=d.bind(null,a.onload),l&&document.head.appendChild(a)}},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.p="/",r=function(e){return new Promise((function(t,s){var r=o.miniCssF(e),i=o.p+r;if(function(e,t){for(var s=document.getElementsByTagName("link"),r=0;r<s.length;r++){var i=(a=s[r]).getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(i===e||i===t))return a}var n=document.getElementsByTagName("style");for(r=0;r<n.length;r++){var a;if((i=(a=n[r]).getAttribute("data-href"))===e||i===t)return a}}(r,i))return t();!function(e,t,s,r){var i=document.createElement("link");i.rel="stylesheet",i.type="text/css",i.onerror=i.onload=function(n){if(i.onerror=i.onload=null,"load"===n.type)s();else{var a=n&&("load"===n.type?"missing":n.type),o=n&&n.target&&n.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+o+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=a,l.request=o,i.parentNode.removeChild(i),r(l)}},i.href=t,document.head.appendChild(i)}(e,i,t,s)}))},i={826:0},o.f.miniCss=function(e,t){i[e]?t.push(i[e]):0!==i[e]&&{268:1}[e]&&t.push(i[e]=r(e).then((function(){i[e]=0}),(function(t){throw delete i[e],t})))},function(){o.b=document.baseURI||self.location.href;var e={826:0};o.f.j=function(t,s){var r=o.o(e,t)?e[t]:void 0;if(0!==r)if(r)s.push(r[2]);else{var i=new Promise((function(s,i){r=e[t]=[s,i]}));s.push(r[2]=i);var n=o.p+o.u(t),a=new Error;o.l(n,(function(s){if(o.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var i=s&&("load"===s.type?"missing":s.type),n=s&&s.target&&s.target.src;a.message="Loading chunk "+t+" failed.\n("+i+": "+n+")",a.name="ChunkLoadError",a.type=i,a.request=n,r[1](a)}}),"chunk-"+t,t)}},o.O.j=function(t){return 0===e[t]};var t=function(t,s){var r,i,n=s[0],a=s[1],l=s[2],c=0;if(n.some((function(t){return 0!==e[t]}))){for(r in a)o.o(a,r)&&(o.m[r]=a[r]);if(l)var u=l(o)}for(t&&t(s);c<n.length;c++)i=n[c],o.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return o.O(u)},s=self.webpackChunkpockmas=self.webpackChunkpockmas||[];s.forEach(t.bind(null,0)),s.push=t.bind(null,s.push.bind(s))}();var l=o.O(void 0,[453],(function(){return o(8626)}));l=o.O(l)}();
//# sourceMappingURL=11ebf72b412ebe311824.bundle.js.map