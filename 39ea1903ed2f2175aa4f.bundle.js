"use strict";(self.webpackChunkpockmas=self.webpackChunkpockmas||[]).push([[918],{6102:function(e,t,i){i.r(t),i.d(t,{RouteResultsList:function(){return f}}),i(6699);var r=i(4657),s=i(6029),n=(i(3948),i(1807)),l=i(542),a=i.n(l),d=new URL(i(2988),i.b),o='<img class="walking-display__img" src="'+a()(d)+'" alt="gehende Person"> <span class="walking-display__minutes"></span>';const u="minutes";class h extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML=o,this.rendered=!0,this.minutesLabel=this.querySelector(".walking-display__minutes"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[u]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(u);this.minutesLabel.innerText="".concat(e,"'")}disconnectedCallback(){}}const c="walking-display";customElements.define(c,h);const m=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class p extends HTMLElement{constructor(){super(),this.rendered=!1,this.timelineElements=[]}connectedCallback(){this.rendered||(this.rendered=!0,this.innerHTML='<ol class="route-timeline"> <li class="route-timeline__time route-timeline__departure-time"></li> <li class="route-timeline__time route-timeline__arrival-time"></li> </ol>',this.departureTimeLabel=this.querySelector(".route-timeline__departure-time"),this.arrivalTimeLabel=this.querySelector(".route-timeline__arrival-time")),this.render()}disconnectedCallback(){}reuseOrCreateElement(e,t){let i,r=e.find((e=>0===e.children[0].tagName.localeCompare(t,void 0,{sensitivity:"accent"})));return r?(e.splice(e.indexOf(r),1),i=r.children[0]):(r=document.createElement("li"),i=document.createElement(t),r.appendChild(i)),0==this.timelineElements.length?this.departureTimeLabel.insertAdjacentElement("afterend",r):this.timelineElements[this.timelineElements.length-1].insertAdjacentElement("afterend",r),this.timelineElements.push(r),i}addWalkingLeg(e,t){this.reuseOrCreateElement(t,c).setAttribute(u,"".concat(Math.ceil(e/6e4)))}addTransportLeg(e,t){let i=this.reuseOrCreateElement(t,n.SA);i.setAttribute(n.wA,e.route.name),i.setAttribute(n.aL,e.route.color)}update(e){this.itinerary=e,this.render()}render(){if(!this.rendered||!this.itinerary||0===this.itinerary.legs.length)return;let e=m.format(new Date(this.itinerary.legs[0].plannedDeparture.getTime()+1e3*this.itinerary.legs[0].delay));this.departureTimeLabel.title="Losgehen um ".concat(e),this.departureTimeLabel.innerText=e;let t=m.format(this.itinerary.legs[this.itinerary.legs.length-1].arrivalTime);this.arrivalTimeLabel.title="Ankunft um ".concat(t),this.arrivalTimeLabel.innerText=t;let i=this.timelineElements;this.timelineElements=[];let r=0;for(let e=0;e<this.itinerary.legs.length;e++){let t=this.itinerary.legs[e];switch(t.type){case 0:r+=t.duration;let s=e<this.itinerary.legs.length-1?this.itinerary.legs[e+1]:null;s&&0==s.type||((0==e||e==this.itinerary.legs.length-1||r>12e4)&&this.addWalkingLeg(r,i),r=0);break;case 1:this.addTransportLeg(t,i)}}for(let e of this.itinerary.legs);for(let e of i)e.remove()}}customElements.define("route-timeline",p),i(4203);var y=i(8738),g=i(3277);class b extends HTMLElement{constructor(){super(),this.rendered=!1,this.router=y.W.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML='<a title="Details zur Route anzeigen"> <departure-display></departure-display> <route-timeline class="route-summary__timeline"></route-timeline> </a>',this.rendered=!0,this.departureDisplay=this.querySelector("departure-display"),this.timeLine=this.querySelector(".route-summary__timeline"),this.link=this.querySelector("a"),(0,g.I)(this.link,"click",(e=>{e.preventDefault(),this.router.router.navigate("r/".concat(this.itinerary.itineraryUrlEncoded),"pockmas - Route")}),this.abortController.signal)),this.render()}render(){if(this.rendered&&this.itinerary.itinerary.legs.length>0){let e=this.itinerary.itinerary.legs.find((e=>1==e.type));e&&(this.departureDisplay.update({delay:e.delay,plannedDeparture:e.plannedDeparture,route:e.route,stop:e.departureStop,tripId:e.tripId,isRealtime:e.isRealtime}),this.link.href="r/".concat(this.itinerary.itineraryUrlEncoded),this.timeLine.update(this.itinerary.itinerary))}}update(e){this.itinerary=e,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-summary",b);class f extends HTMLElement{constructor(){super(),this.rendered=!1,this.itineraries=[],this.store=r.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="",this.rendered=!0,this.renderer=new s.T(this,(e=>this.itineraries.indexOf(e)),(e=>new b))),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),this.init(this.store.state)}setResults(e){(null==e?void 0:e.results)&&(this.itineraries=e.results,this.renderer.update(this.itineraries,((e,t)=>{e.update(t)})))}update(e,t){t.includes("results")&&this.setResults(e)}init(e){this.setResults(e)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-results-list",f)},2988:function(e,t,i){e.exports=i.p+"355f516c704b4163eba7.svg"}}]);
//# sourceMappingURL=39ea1903ed2f2175aa4f.bundle.js.map