!function(){var e,t={542:function(e){"use strict";e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),t.hash&&(e+=t.hash),t.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(e)?'"'.concat(e,'"'):e):e}},3151:function(e,t,s){"use strict";s(3948);class r extends HTMLElement{constructor(){super(),this.popupShown=!1,this.source=this,this.keyListener=this.keyListener.bind(this),this.clickListener=this.clickListener.bind(this)}connectedCallback(){this.updateStyles()}keyListener(e){"Escape"==e.key&&this.hide()}setSource(e){this.source=e}clickListener(e){this.source.contains(e.target)||this.hide()}hide(){this.popupShown&&(document.removeEventListener("keydown",this.keyListener),document.removeEventListener("click",this.clickListener),this.popupShown=!1,this.updateStyles())}show(){this.popupShown||(document.addEventListener("keydown",this.keyListener),document.addEventListener("click",this.clickListener),this.popupShown=!0,this.updateStyles())}updateStyles(){this.style.display=this.popupShown?"":"none"}toggle(){this.popupShown?this.hide():this.show()}disconnectedCallback(){this.hide()}}function i(e,t,s,r){e.addEventListener(t,s),r.addEventListener("abort",(()=>{e.removeEventListener(t,s)}))}customElements.define("app-popup",r);const n="label";class a extends HTMLElement{constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<button class="search-result-card__button"> <span class="search-result-card__text"></span> </button>',this.rendered=!0,this.text=this.querySelector(".search-result-card__text")),this.updateAttributes()}attributeChangedCallback(){this.updateAttributes()}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(n);this.text.innerText=e}static get observedAttributes(){return[n]}disconnectedCallback(){}}customElements.define("search-result-card",a);const l="label";class o extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<button class="stop-search"> <label class="stop-search__label"></label> <div> <span class="stop-search__selected-result-label">auswählen</span> </div> </button> <app-popup> <div class="stop-search__search"> <div class="stop-search__search-input-container"> <label class="stop-search__label"></label> <input placeholder="Suche eine Station" class="stop-search__search-input" type="search" autocomplete="off" autocapitalize="off"> </div> <div class="stop-search__results"> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> <search-result-card style="display:none" class="stop-search__search-result"></search-result-card> </div> </div> </app-popup>',this.rendered=!0,this.labels=Array.from(this.querySelectorAll(".stop-search__label")),this.button=this.querySelector("button"),this.popup=this.querySelector("app-popup"),this.popup.setSource(this),this.input=this.querySelector(".stop-search__search-input"),this.searchResults=Array.from(this.querySelectorAll(".stop-search__search-result")),this.selectedResultLabel=this.querySelector(".stop-search__selected-result-label")),this.updateAttributes(),i(this.button,"click",(e=>this.onClick(e)),this.abortController.signal);for(let e=0;e<this.searchResults.length;e++)i(this.searchResults[e],"click",(t=>this.onSearchResultClick(e)),this.abortController.signal)}onClick(e){this.popup.show(),this.input.focus()}onSearchResultClick(e){this.selectedResultLabel.innerText=this.searchResults[e].getAttribute("label"),this.dispatchEvent(new CustomEvent("stop-selected",{detail:e})),this.popup.hide()}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[l]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(l);for(let t of this.labels)t.innerText=e;this.button.setAttribute("title","".concat(e," auswählen")),this.labels[1].setAttribute("for","".concat(e,"-search-input")),this.input.setAttribute("id","".concat(e,"-search-input"))}disconnectedCallback(){this.abortController.abort()}get searchTerm(){return this.input.value}setResults(e){if(this.rendered)for(let t=0;t<this.searchResults.length;t++)t<e.length?(this.searchResults[t].setAttribute("label",e[t].name),this.searchResults[t].style.display=""):this.searchResults[t].style.display="none"}}customElements.define("stop-search",o),s(285),s(1637);class c{constructor(){this._state=null,this.subscriptions=[],this.worker=new Worker(new URL(s.p+s.u(531),s.b)),this.worker.addEventListener("message",(e=>{let[t,s]=e.data;this._state=Object.assign(Object.assign({},this._state),t);for(let e of this.subscriptions)try{e.call(this._state,s)}catch(e){console.error("Error while updating",e)}}))}get state(){return this._state}static getInstance(){return null==this.instance&&(this.instance=new c),this.instance}subscribe(e,t){let s={call:e};this.subscriptions.push(s),t&&t.addEventListener("abort",(()=>{this.subscriptions.splice(this.subscriptions.indexOf(s),1)}))}postAction(e){this.worker.postMessage(e)}}c.instance=null;class h{constructor(){this.type=0}}class u{constructor(e){this.term=e,this.type=1}}class d{constructor(e){this.term=e,this.type=2}}class p{constructor(e,t){this.departure=e,this.arrival=t,this.type=4}}class b extends HTMLElement{constructor(){super(),this.store=c.getInstance(),this.store.postAction(new h)}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<div> <stop-search label="Abfahrt" class="route-search__abfahrt" id="departure-stop-search"></stop-search> <stop-search label="Ziel" id="arrival-stop-search"></stop-search> </div>',this.departureStopSearch=this.querySelector("#departure-stop-search"),this.arrivalStopSearch=this.querySelector("#arrival-stop-search"),this.rendered=!0),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),i(this.departureStopSearch,"input",(()=>this.store.postAction(new u(this.departureStopSearch.searchTerm))),this.abortController.signal),i(this.arrivalStopSearch,"input",(()=>this.store.postAction(new d(this.arrivalStopSearch.searchTerm))),this.abortController.signal),i(this.departureStopSearch,"stop-selected",(e=>{this.selectedDepartureStop=e.detail,this.onStopsSelected()}),this.abortController.signal),i(this.arrivalStopSearch,"stop-selected",(e=>{this.selectedArrivalStop=e.detail,this.onStopsSelected()}),this.abortController.signal)}update(e,t){t.includes("departureStopResults")&&this.departureStopSearch.setResults(e.departureStopResults),t.includes("arrivalStopResults")&&this.arrivalStopSearch.setResults(e.arrivalStopResults)}onStopsSelected(){null!=this.selectedDepartureStop&&null!=this.selectedArrivalStop&&this.store.postAction(new p(this.selectedDepartureStop,this.selectedArrivalStop))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-search",b);class m{constructor(e,t,s){this.listElement=e,this.keySelector=t,this.createElement=s,this.keyToElement=new Map,this.elementToKey=new WeakMap}update(e,t){let s=new Map,r=e=>s.get(e)||(()=>{let t=this.keySelector(e);return s.set(e,t),t})();for(let s of Array.from(this.listElement.children)){let i=s,n=e.find((e=>this.elementToKey.get(i)==r(e)));n?t(i,n):this.listElement.removeChild(i)}let i=null,n=new Map;for(let s of e){let e=r(s),a=this.keyToElement.get(e);a||(a=this.createElement(s),t(a,s),this.elementToKey.set(a,e)),n.set(e,a),null==i&&a!=this.listElement.firstElementChild?this.listElement.prepend(a):null!=i&&i.nextElementSibling!=a&&i.insertAdjacentElement("afterend",a),i=a}this.keyToElement=n}}const f="route",y="route-color";class g extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<span class="transit-display__route"></span>',this.rendered=!0,this.routeLabel=this.querySelector(".transit-display__route"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[f,y]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(f);this.routeLabel.innerText=e;let t=this.getAttribute(y);this.style.backgroundColor=t?"#".concat(t):""}disconnectedCallback(){}}const _="transit-display";customElements.define(_,g);var v=s(542),k=s.n(v),S=new URL(s(2988),s.b),w='<img class="walking-display__img" src="'+k()(S)+'" alt="gehende Person"> <span class="walking-display__minutes"></span>';const L="minutes";class E extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML=w,this.rendered=!0,this.minutesLabel=this.querySelector(".walking-display__minutes"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[L]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(L);this.minutesLabel.innerText="".concat(e,"'")}disconnectedCallback(){}}const A="walking-display";customElements.define(A,E);const x=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class T extends HTMLElement{constructor(){super(),this.rendered=!1,this.timelineElements=[]}connectedCallback(){this.rendered||(this.rendered=!0,this.innerHTML='<ol class="route-timeline"> <li class="route-timeline__time route-timeline__departure-time"></li> <li class="route-timeline__time route-timeline__arrival-time"></li> </ol>',this.departureTimeLabel=this.querySelector(".route-timeline__departure-time"),this.arrivalTimeLabel=this.querySelector(".route-timeline__arrival-time")),this.render()}disconnectedCallback(){}reuseOrCreateElement(e,t){let s,r=e.find((e=>0===e.children[0].tagName.localeCompare(t,void 0,{sensitivity:"accent"})));return r?(e.splice(e.indexOf(r),1),s=r.children[0]):(r=document.createElement("li"),s=document.createElement(t),r.appendChild(s)),0==this.timelineElements.length?this.departureTimeLabel.insertAdjacentElement("afterend",r):this.timelineElements[this.timelineElements.length-1].insertAdjacentElement("afterend",r),this.timelineElements.push(r),s}addWalkingLeg(e,t){this.reuseOrCreateElement(t,A).setAttribute(L,"".concat(Math.ceil(e/6e4)))}addTransportLeg(e,t){let s=this.reuseOrCreateElement(t,_);s.setAttribute(f,e.route.name),s.setAttribute(y,e.route.color)}update(e){this.itinerary=e,this.render()}render(){if(!this.rendered||!this.itinerary||0===this.itinerary.legs.length)return;let e=x.format(new Date(this.itinerary.legs[0].plannedDeparture.getTime()+1e3*this.itinerary.legs[0].delay));this.departureTimeLabel.title="Losgehen um ".concat(e),this.departureTimeLabel.innerText=e;let t=x.format(this.itinerary.legs[this.itinerary.legs.length-1].arrivalTime);this.arrivalTimeLabel.title="Ankunft um ".concat(t),this.arrivalTimeLabel.innerText=t;let s=this.timelineElements;this.timelineElements=[];let r=0;for(let e=0;e<this.itinerary.legs.length;e++){let t=this.itinerary.legs[e];switch(t.type){case 0:r+=t.duration;let i=e<this.itinerary.legs.length-1?this.itinerary.legs[e+1]:null;i&&0==i.type||((0==e||e==this.itinerary.legs.length-1||r>12e4)&&this.addWalkingLeg(r,s),r=0);break;case 1:this.addTransportLeg(t,s)}}for(let e of this.itinerary.legs);for(let e of s)e.remove()}}customElements.define("route-timeline",T);const C="text";class q extends HTMLElement{constructor(){super(),this.isFront=!0,this.beforeValue=null,this.animating=!1,this.connected=!1,this.queuedValue=null;let e=this.attachShadow({mode:"open"});e.innerHTML='<style>.box{perspective:5em;display:inline-block}.box-inner{transform-style:preserve-3d;display:inline-block;position:relative;border-radius:2px;transition:transform,box-shadow;animation-timing-function:ease-in-out}.back,.front{backface-visibility:hidden;display:inline-block;position:absolute;left:0}.front{transform:rotateX(0)}.back{transform:rotateX(180deg)}.actual{visibility:hidden}.show-back{animation:flip-front-to-back .8s;transform:rotateX(180deg)}.show-front{animation:flip-back-to-front .8s;transform:rotateX(0)}@keyframes flip-back-to-front{0%{transform:rotateX(180deg);box-shadow:none}10%{transform:rotateX(180deg)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(360deg)}100%{transform:rotateX(360deg);box-shadow:none}}@keyframes flip-front-to-back{0%{transform:rotateX(0);box-shadow:none}10%{transform:rotateX(0)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(180deg)}100%{transform:rotateX(180deg);box-shadow:none}}</style><span class="box"><span class="box-inner"><span class="front" aria-hidden="true"></span><span class="back" aria-hidden="true"></span><span class="actual"></span></span></span>',this.frontSpan=e.querySelector(".front"),this.backSpan=e.querySelector(".back"),this.boxInner=e.querySelector(".box-inner"),this.actualSpan=e.querySelector(".actual"),this.listener=()=>this.animationEnded()}connectedCallback(){this.connected=!0,this.boxInner.addEventListener("animationend",this.listener)}animationEnded(){this.animating=!1,this.queuedValue&&(this.updateAttributes(),this.queuedValue=null)}disconnectedCallback(){this.connected=!1,this.boxInner.removeEventListener("animationend",this.listener)}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[C]}updateAttributes(){let e=this.getAttribute(C);this.beforeValue?e!==this.beforeValue&&(this.animating?this.queuedValue=e:(this.isFront=!this.isFront,this.isFront?(this.frontSpan.innerText=e,this.boxInner.classList.remove("show-back"),this.boxInner.classList.add("show-front")):(this.backSpan.innerText=e,this.boxInner.classList.remove("show-front"),this.boxInner.classList.add("show-back")),this.connected&&(this.animating=!0),this.actualSpan.innerText=e,this.beforeValue=e)):(this.isFront=!0,this.frontSpan.innerText=e,this.backSpan.innerText="",this.boxInner.classList.remove("show-back"),this.boxInner.classList.remove("show-front"),this.beforeValue=e,this.actualSpan.innerText=e)}}customElements.define("flip-display",q);const M="time";class H extends HTMLElement{constructor(){super();let e=this.attachShadow({mode:"open"});e.innerHTML="<flip-display></flip-display><flip-display></flip-display>:<flip-display></flip-display><flip-display></flip-display>",this.digits=Array.from(e.querySelectorAll("flip-display"))}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[M]}updateAttributes(){let e=this.getAttribute(M),t=new Date(parseInt(e)),s=t.getHours(),r=t.getMinutes();this.digits[0].setAttribute(C,(s/10>>0).toString()),this.digits[1].setAttribute(C,(s%10).toString()),this.digits[2].setAttribute(C,(r/10>>0).toString()),this.digits[3].setAttribute(C,(r%10).toString())}}customElements.define("flip-time-display",H);const R=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class O extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<div class="route-summary__departure"> <flip-time-display class="route-summary__departure-time"></flip-time-display> <div> <transit-display class="route-summary__departure-line"></transit-display> </div> <span class="route-summary__departure-stop"></span> <span class="route-summary__planned-time"></span> <span class="route-summary__departure-direction">Richtung <span class="route-summary__departure-headsign"></span> </span> </div> <route-timeline class="route-summary__timeline"></route-timeline>',this.rendered=!0,this.departureTime=this.querySelector(".route-summary__departure-time"),this.plannedTime=this.querySelector(".route-summary__planned-time"),this.departureLine=this.querySelector(".route-summary__departure-line"),this.departureStop=this.querySelector(".route-summary__departure-stop"),this.departureHeadsign=this.querySelector(".route-summary__departure-headsign"),this.timeLine=this.querySelector(".route-summary__timeline")),this.render()}render(){if(this.rendered&&this.itinerary.legs.length>0){let e=this.itinerary.legs.find((e=>1==e.type));if(e){let t=new Date(e.plannedDeparture.getTime()+1e3*e.delay),s=R.format(t);this.departureTime.setAttribute("time",""+t.getTime()),this.departureTime.setAttribute("title","Abfahrt um ".concat(s));let r=R.format(e.plannedDeparture),i=r!=s;this.plannedTime.innerText="".concat(e.isRealtime?i?r:"pünktlich":""),this.plannedTime.style.textDecoration=i?"line-through":"none",this.departureLine.setAttribute(f,e.route.name),this.departureLine.setAttribute(y,e.route.color),this.departureStop.innerText=e.departureStop.stopName,this.departureHeadsign.innerText=e.route.headsign,this.timeLine.update(this.itinerary)}}}update(e){this.itinerary=e,this.render()}disconnectedCallback(){}}customElements.define("route-summary",O);class I extends HTMLElement{constructor(){super(),this.rendered=!1,this.itineraries=[],this.store=c.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="",this.rendered=!0,this.renderer=new m(this,(e=>this.itineraries.indexOf(e)),(e=>new O))),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal)}update(e,t){t.includes("results")&&(this.itineraries=e.results,this.renderer.update(this.itineraries,((e,t)=>{e.update(t)})))}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results",I),s(1420);class j{constructor(e){this.increment=e,this.type=5}}let D=c.getInstance();D.postAction(new class{constructor(){this.type=3}}),document.querySelector("#add-5-min").addEventListener("click",(()=>{D.postAction(new j(3e5))}))},1420:function(){let e=null;function t(){document.querySelector("#updateready").style.display=""}if(document.querySelector("#update-btn").addEventListener("click",(()=>{e.postMessage({action:"skipWaiting"})})),"serviceWorker"in navigator){window.addEventListener("load",(async()=>{try{let s=await navigator.serviceWorker.register("./sw.js");if(!navigator.serviceWorker.controller)return;let r=s=>{s.addEventListener("statechange",(()=>{"installed"==s.state&&(e=s,t())}))};if(s.waiting)return e=s.waiting,void t();if(s.installing)return void r(s.installing);s.addEventListener("updatefound",(()=>r(s.installing)))}catch(e){console.log("SW registration failed.",e)}}));let s=!1;navigator.serviceWorker.addEventListener("controllerchange",(()=>{s||(s=!0,window.location.reload())}))}},8006:function(e,t,s){var r=s(6324),i=s(748).concat("length","prototype");t.f=Object.getOwnPropertyNames||function(e){return r(e,i)}},2988:function(e,t,s){"use strict";e.exports=s.p+"355f516c704b4163eba7.svg"}},s={};function r(e){var i=s[e];if(void 0!==i)return i.exports;var n=s[e]={exports:{}};return t[e](n,n.exports,r),n.exports}r.m=t,e=[],r.O=function(t,s,i,n){if(!s){var a=1/0;for(h=0;h<e.length;h++){s=e[h][0],i=e[h][1],n=e[h][2];for(var l=!0,o=0;o<s.length;o++)(!1&n||a>=n)&&Object.keys(r.O).every((function(e){return r.O[e](s[o])}))?s.splice(o--,1):(l=!1,n<a&&(a=n));if(l){e.splice(h--,1);var c=i();void 0!==c&&(t=c)}}return t}n=n||0;for(var h=e.length;h>0&&e[h-1][2]>n;h--)e[h]=e[h-1];e[h]=[s,i,n]},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,{a:t}),t},r.d=function(e,t){for(var s in t)r.o(t,s)&&!r.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},r.u=function(e){return"0a66bf67658f70b910f0.bundle.js"},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/",function(){r.b=document.baseURI||self.location.href;var e={826:0};r.O.j=function(t){return 0===e[t]};var t=function(t,s){var i,n,a=s[0],l=s[1],o=s[2],c=0;if(a.some((function(t){return 0!==e[t]}))){for(i in l)r.o(l,i)&&(r.m[i]=l[i]);if(o)var h=o(r)}for(t&&t(s);c<a.length;c++)n=a[c],r.o(e,n)&&e[n]&&e[n][0](),e[a[c]]=0;return r.O(h)},s=self.webpackChunkpockmas=self.webpackChunkpockmas||[];s.forEach(t.bind(null,0)),s.push=t.bind(null,s.push.bind(s))}();var i=r.O(void 0,[453],(function(){return r(3151)}));i=r.O(i)}();
//# sourceMappingURL=f93de3fe09582dde321f.bundle.js.map