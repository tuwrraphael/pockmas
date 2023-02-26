"use strict";(self.webpackChunkpockmas=self.webpackChunkpockmas||[]).push([[102],{542:function(e){e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),t.hash&&(e+=t.hash),t.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(e)?'"'.concat(e,'"'):e):e}},5611:function(e,t,i){var r=i(542),s=i.n(r),n=new URL(i(4242),i.b),a='<div class="departure-display__departure"> <flip-time-display class="departure-display__departure-time"></flip-time-display> <div> <transit-display class="departure-display__departure-line"></transit-display> </div> <span class="departure-display__departure-headsign"></span> <span class="departure-display__planned-time"></span> <span class="departure-display__departure-stop-display"> <img class="departure-display__departure-stop-img" src="'+s()(n)+'" alt="Abfahrtsstation">Abfahrt: <span class="departure-display__departure-stop"></span> </span> </div>',l=(i(2208),i(1807));const o=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class d extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML=a,this.rendered=!0,this.departureTime=this.querySelector(".departure-display__departure-time"),this.plannedTime=this.querySelector(".departure-display__planned-time"),this.departureLine=this.querySelector(".departure-display__departure-line"),this.departureStop=this.querySelector(".departure-display__departure-stop"),this.departureHeadsign=this.querySelector(".departure-display__departure-headsign")),this.render()}render(){var e,t,i,r;if(this.rendered&&this.nextDeparture){if((null===(e=this.renderedDeparture)||void 0===e?void 0:e.plannedDeparture)!==this.nextDeparture.plannedDeparture||(null===(t=this.renderedDeparture)||void 0===t?void 0:t.delay)!==this.nextDeparture.delay||this.renderedDeparture.isRealtime!==this.nextDeparture.isRealtime){let e=new Date(this.nextDeparture.plannedDeparture.getTime()+1e3*this.nextDeparture.delay),t=o.format(e);this.departureTime.setAttribute("time",""+e.getTime()),this.departureTime.setAttribute("title",`Abfahrt um ${t}`);let i=o.format(this.nextDeparture.plannedDeparture),r=i!=t;this.plannedTime.innerText=`${this.nextDeparture.isRealtime?r?i:"pünktlich":""}`,this.plannedTime.style.textDecoration=r?"line-through":"none"}(null===(i=this.renderedDeparture)||void 0===i?void 0:i.route.id)!==this.nextDeparture.route.id&&(this.departureLine.setAttribute(l.wA,this.nextDeparture.route.name),this.departureLine.setAttribute(l.aL,this.nextDeparture.route.color),this.departureHeadsign.innerText=this.nextDeparture.route.headsign),(null===(r=this.renderedDeparture)||void 0===r?void 0:r.stop.stopId)!==this.nextDeparture.stop.stopId&&(this.departureStop.innerText=this.nextDeparture.stop.stopName)}this.renderedDeparture=this.nextDeparture}update(e){this.nextDeparture=e,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("departure-display",d)},2208:function(){const e="text";class t extends HTMLElement{constructor(){super(),this.isFront=!0,this.beforeValue=null,this.animating=!1,this.connected=!1,this.queuedValue=null;let e=this.attachShadow({mode:"open"});e.innerHTML='<style>.box{perspective:5em;display:inline-block}.box-inner{transform-style:preserve-3d;display:inline-block;position:relative;border-radius:2px;transition:transform,box-shadow;animation-timing-function:ease-in-out}.back,.front{backface-visibility:hidden;display:inline-block;position:absolute;left:0}.front{transform:rotateX(0)}.back{transform:rotateX(180deg)}.actual{visibility:hidden}.show-back{animation:flip-front-to-back .8s;transform:rotateX(180deg)}.show-front{animation:flip-back-to-front .8s;transform:rotateX(0)}@keyframes flip-back-to-front{0%{transform:rotateX(180deg);box-shadow:none}10%{transform:rotateX(180deg)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(360deg)}100%{transform:rotateX(360deg);box-shadow:none}}@keyframes flip-front-to-back{0%{transform:rotateX(0);box-shadow:none}10%{transform:rotateX(0)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(180deg)}100%{transform:rotateX(180deg);box-shadow:none}}</style><span class="box"><span class="box-inner"><span class="front" aria-hidden="true"></span><span class="back" aria-hidden="true"></span><span class="actual"></span></span></span>',this.frontSpan=e.querySelector(".front"),this.backSpan=e.querySelector(".back"),this.boxInner=e.querySelector(".box-inner"),this.actualSpan=e.querySelector(".actual"),this.listener=()=>this.animationEnded()}connectedCallback(){this.connected=!0,this.boxInner.addEventListener("animationend",this.listener)}animationEnded(){this.animating=!1,this.queuedValue&&(this.updateAttributes(),this.queuedValue=null)}disconnectedCallback(){this.connected=!1,this.boxInner.removeEventListener("animationend",this.listener)}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[e]}updateAttributes(){let t=this.getAttribute(e);this.beforeValue?t!==this.beforeValue&&(this.animating?this.queuedValue=t:(this.isFront=!this.isFront,this.isFront?(this.frontSpan.innerText=t,this.boxInner.classList.remove("show-back"),this.boxInner.classList.add("show-front")):(this.backSpan.innerText=t,this.boxInner.classList.remove("show-front"),this.boxInner.classList.add("show-back")),this.connected&&(this.animating=!0),this.actualSpan.innerText=t,this.beforeValue=t)):(this.isFront=!0,this.frontSpan.innerText=t,this.backSpan.innerText="",this.boxInner.classList.remove("show-back"),this.boxInner.classList.remove("show-front"),this.beforeValue=t,this.actualSpan.innerText=t)}}customElements.define("flip-display",t);const i="time";class r extends HTMLElement{constructor(){super();let e=this.attachShadow({mode:"open"});e.innerHTML="<flip-display></flip-display><flip-display></flip-display>:<flip-display></flip-display><flip-display></flip-display>",this.digits=Array.from(e.querySelectorAll("flip-display"))}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[i]}updateAttributes(){let t=this.getAttribute(i),r=new Date(parseInt(t)),s=r.getHours(),n=r.getMinutes();this.digits[0].setAttribute(e,(s/10>>0).toString()),this.digits[1].setAttribute(e,(s%10).toString()),this.digits[2].setAttribute(e,(n/10>>0).toString()),this.digits[3].setAttribute(e,(n%10).toString())}}customElements.define("flip-time-display",r)},6102:function(e,t,i){i.r(t),i.d(t,{RouteResultsList:function(){return k}});var r=i(4657),s=i(6029),n=i(542),a=i.n(n),l=new URL(i(3752),i.b),o='<a title="Details zur Route anzeigen"> <departure-display></departure-display> <div class="route-summary__timeline-container"> <route-timeline class="route-summary__timeline"></route-timeline> <div class="route-summary__duration" data-ref="duration-container"> <img class="route-summary__icon-duration" src="'+a()(l)+'" alt="Fahrtdauericon"> <span data-ref="duration-label" class="route-summary__duration-label"> </span></div> </div> </a>',d=i(1807),u=new URL(i(2988),i.b),h='<img class="walking-display__img" src="'+a()(u)+'" alt="gehende Person"> <span class="walking-display__minutes"></span>';const p="minutes";class c extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML=h,this.rendered=!0,this.minutesLabel=this.querySelector(".walking-display__minutes"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[p]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(p);this.minutesLabel.innerText=`${e}'`}disconnectedCallback(){}}const m="walking-display";customElements.define(m,c);const b=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class y extends HTMLElement{constructor(){super(),this.rendered=!1,this.timelineElements=[]}connectedCallback(){this.rendered||(this.rendered=!0,this.innerHTML='<ol class="route-timeline"> <li class="route-timeline__time route-timeline__departure-time"></li> <li class="route-timeline__time route-timeline__arrival-time"></li> </ol>',this.departureTimeLabel=this.querySelector(".route-timeline__departure-time"),this.arrivalTimeLabel=this.querySelector(".route-timeline__arrival-time")),this.render()}disconnectedCallback(){}reuseOrCreateElement(e,t){let i,r=e.find((e=>0===e.children[0].tagName.localeCompare(t,void 0,{sensitivity:"accent"})));return r?(e.splice(e.indexOf(r),1),i=r.children[0]):(r=document.createElement("li"),i=document.createElement(t),r.appendChild(i)),0==this.timelineElements.length?this.departureTimeLabel.insertAdjacentElement("afterend",r):this.timelineElements[this.timelineElements.length-1].insertAdjacentElement("afterend",r),this.timelineElements.push(r),i}addWalkingLeg(e,t){this.reuseOrCreateElement(t,m).setAttribute(p,`${Math.ceil(e/6e4)}`)}addTransportLeg(e,t){let i=this.reuseOrCreateElement(t,d.SA);i.setAttribute(d.wA,e.route.name),i.setAttribute(d.aL,e.route.color)}update(e){this.itinerary=e,this.render()}render(){if(!this.rendered||!this.itinerary||0===this.itinerary.legs.length)return;let e=b.format(new Date(this.itinerary.legs[0].plannedDeparture.getTime()+1e3*this.itinerary.legs[0].delay));this.departureTimeLabel.title=`Losgehen um ${e}`,this.departureTimeLabel.innerText=e;let t=b.format(this.itinerary.legs[this.itinerary.legs.length-1].arrivalTime);this.arrivalTimeLabel.title=`Ankunft um ${t}`,this.arrivalTimeLabel.innerText=t;let i=this.timelineElements;this.timelineElements=[];let r=0;for(let e=0;e<this.itinerary.legs.length;e++){let t=this.itinerary.legs[e];switch(t.type){case 0:r+=t.duration;let s=e<this.itinerary.legs.length-1?this.itinerary.legs[e+1]:null;s&&0==s.type||((0==e||e==this.itinerary.legs.length-1||r>12e4)&&this.addWalkingLeg(r,i),r=0);break;case 1:this.addTransportLeg(t,i)}}for(let e of this.itinerary.legs);for(let e of i)e.remove()}}customElements.define("route-timeline",y),i(5611);var g=i(4488),f=i(3277);class x extends HTMLElement{constructor(){super(),this.rendered=!1,this.router=g.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML=o,this.rendered=!0,this.departureDisplay=this.querySelector("departure-display"),this.timeLine=this.querySelector(".route-summary__timeline"),this.link=this.querySelector("a"),this.durationContainer=this.querySelector(".route-summary__duration"),this.durationLabel=this.querySelector(".route-summary__duration-label"),(0,f.I)(this.link,"click",(e=>{e.preventDefault(),this.router.router.navigate(`r/${this.itinerary.itineraryUrlEncoded}`,"pockmas - Route")}),this.abortController.signal)),this.render()}render(){if(this.rendered&&this.itinerary.itinerary.legs.length>0){let e=this.itinerary.itinerary.legs.find((e=>1==e.type));e&&(this.departureDisplay.update({delay:e.delay,plannedDeparture:e.plannedDeparture,route:e.route,stop:e.departureStop,tripId:e.tripId,isRealtime:e.isRealtime}),this.link.href=`r/${this.itinerary.itineraryUrlEncoded}`,this.timeLine.update(this.itinerary.itinerary));let t=this.itinerary.itinerary.legs[this.itinerary.itinerary.legs.length-1].arrivalTime.getTime()-this.itinerary.itinerary.legs[0].plannedDeparture.getTime(),i=Math.ceil(t/6e4);this.durationLabel.innerText=`${i}'`,this.durationContainer.title=`Dauer ${i} Minuten`,this.durationLabel.innerText=`${i}'`}}update(e){this.itinerary=e,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-summary",x);class k extends HTMLElement{constructor(){super(),this.rendered=!1,this.itineraries=[],this.store=r.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="",this.rendered=!0,this.renderer=new s.T(this,(e=>this.itineraries.indexOf(e)),(e=>new x))),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),this.init(this.store.state)}setResults(e){(null==e?void 0:e.results)&&(this.itineraries=e.results,this.renderer.update(this.itineraries,((e,t)=>{e.update(t)})))}update(e,t){t.includes("results")&&this.setResults(e)}init(e){this.setResults(e)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results-list",k)},1807:function(e,t,i){i.d(t,{wA:function(){return r},aL:function(){return s},SA:function(){return a}});const r="route",s="route-color";class n extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<span class="transit-display__route"></span>',this.rendered=!0,this.routeLabel=this.querySelector(".transit-display__route"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[r,s]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(r)||"";e=e.replace(/\s/g,""),this.routeLabel.classList.toggle("transit-display__route--long",e.length>3),this.routeLabel.innerText=e;let t=this.getAttribute(s);this.style.backgroundColor=t?`#${t}`:""}disconnectedCallback(){}}const a="transit-display";customElements.define(a,n)},6029:function(e,t,i){i.d(t,{T:function(){return r}});class r{constructor(e,t,i){this.listElement=e,this.keySelector=t,this.createElement=i,this.keyToElement=new Map,this.elementToKey=new WeakMap}update(e,t){let i=new Map,r=(e,t)=>i.get(e)||(()=>{let r=this.keySelector(e,t);return i.set(e,r),r})();for(let i of Array.from(this.listElement.children)){let s=i,n=e.find(((e,t)=>this.elementToKey.get(s)==r(e,t)));n?t(s,n):this.listElement.removeChild(s)}let s=null,n=new Map;for(let i=0;i<e.length;i++){let a=e[i],l=r(a,i),o=this.keyToElement.get(l);o||(o=this.createElement(a),t(o,a),this.elementToKey.set(o,l)),n.set(l,o),null==s&&o!=this.listElement.firstElementChild?this.listElement.prepend(o):null!=s&&s.nextElementSibling!=o&&s.insertAdjacentElement("afterend",o),s=o}this.keyToElement=n}}},3752:function(e,t,i){e.exports=i.p+"a4b43913431e7696a02c.svg"},4242:function(e,t,i){e.exports=i.p+"13c17db0318beb7b7133.svg"},2988:function(e,t,i){e.exports=i.p+"355f516c704b4163eba7.svg"}}]);
//# sourceMappingURL=0a03c391987562812141.bundle.js.map