"use strict";(self.webpackChunkpockmas=self.webpackChunkpockmas||[]).push([[159],{8922:function(t){t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var i="",n=void 0!==e[5];return e[4]&&(i+="@supports (".concat(e[4],") {")),e[2]&&(i+="@media ".concat(e[2]," {")),n&&(i+="@layer".concat(e[5].length>0?" ".concat(e[5]):""," {")),i+=t(e),n&&(i+="}"),e[2]&&(i+="}"),e[4]&&(i+="}"),i})).join("")},e.i=function(t,i,n,s,r){"string"==typeof t&&(t=[[null,t,void 0]]);var o={};if(n)for(var a=0;a<this.length;a++){var l=this[a][0];null!=l&&(o[l]=!0)}for(var h=0;h<t.length;h++){var d=[].concat(t[h]);n&&o[d[0]]||(void 0!==r&&(void 0===d[5]||(d[1]="@layer".concat(d[5].length>0?" ".concat(d[5]):""," {").concat(d[1],"}")),d[5]=r),i&&(d[2]?(d[1]="@media ".concat(d[2]," {").concat(d[1],"}"),d[2]=i):d[2]=i),s&&(d[4]?(d[1]="@supports (".concat(d[4],") {").concat(d[1],"}"),d[4]=s):d[4]="".concat(s)),e.push(d))}},e}},4251:function(t){t.exports=function(t){var e=t[1],i=t[3];if(!i)return e;if("function"==typeof btoa){var n=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),s="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(n),r="/*# ".concat(s," */");return[e].concat([r]).join("\n")}return[e].join("\n")}},542:function(t){t.exports=function(t,e){return e||(e={}),t?(t=String(t.__esModule?t.default:t),e.hash&&(t+=e.hash),e.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(t)?'"'.concat(t,'"'):t):t}},4203:function(t,e,i){var n=i(542),s=i.n(n),r=new URL(i(4242),i.b),o='<div class="departure-display__departure"> <flip-time-display class="departure-display__departure-time"></flip-time-display> <div> <transit-display class="departure-display__departure-line"></transit-display> </div> <span class="departure-display__departure-headsign"></span> <span class="departure-display__planned-time"></span> <span class="departure-display__departure-stop-display"> <img class="departure-display__departure-stop-img" src="'+s()(r)+'" alt="Abfahrtsstation">Abfahrt: <span class="departure-display__departure-stop"></span> </span> </div>',a=(i(2208),i(1807));const l=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class h extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML=o,this.rendered=!0,this.departureTime=this.querySelector(".departure-display__departure-time"),this.plannedTime=this.querySelector(".departure-display__planned-time"),this.departureLine=this.querySelector(".departure-display__departure-line"),this.departureStop=this.querySelector(".departure-display__departure-stop"),this.departureHeadsign=this.querySelector(".departure-display__departure-headsign")),this.render()}render(){var t,e,i,n;if(this.rendered&&this.nextDeparture){if((null===(t=this.renderedDeparture)||void 0===t?void 0:t.plannedDeparture)!==this.nextDeparture.plannedDeparture||(null===(e=this.renderedDeparture)||void 0===e?void 0:e.delay)!==this.nextDeparture.delay||this.renderedDeparture.isRealtime!==this.nextDeparture.isRealtime){let t=new Date(this.nextDeparture.plannedDeparture.getTime()+1e3*this.nextDeparture.delay),e=l.format(t);this.departureTime.setAttribute("time",""+t.getTime()),this.departureTime.setAttribute("title",`Abfahrt um ${e}`);let i=l.format(this.nextDeparture.plannedDeparture),n=i!=e;this.plannedTime.innerText=`${this.nextDeparture.isRealtime?n?i:"pünktlich":""}`,this.plannedTime.style.textDecoration=n?"line-through":"none"}(null===(i=this.renderedDeparture)||void 0===i?void 0:i.route.id)!==this.nextDeparture.route.id&&(this.departureLine.setAttribute(a.wA,this.nextDeparture.route.name),this.departureLine.setAttribute(a.aL,this.nextDeparture.route.color),this.departureHeadsign.innerText=this.nextDeparture.route.headsign),(null===(n=this.renderedDeparture)||void 0===n?void 0:n.stop.stopId)!==this.nextDeparture.stop.stopId&&(this.departureStop.innerText=this.nextDeparture.stop.stopName)}this.renderedDeparture=this.nextDeparture}update(t){this.nextDeparture=t,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("departure-display",h)},2208:function(){const t="text";class e extends HTMLElement{constructor(){super(),this.isFront=!0,this.beforeValue=null,this.animating=!1,this.connected=!1,this.queuedValue=null;let t=this.attachShadow({mode:"open"});t.innerHTML='<style>.box{perspective:5em;display:inline-block}.box-inner{transform-style:preserve-3d;display:inline-block;position:relative;border-radius:2px;transition:transform,box-shadow;animation-timing-function:ease-in-out}.back,.front{backface-visibility:hidden;display:inline-block;position:absolute;left:0}.front{transform:rotateX(0)}.back{transform:rotateX(180deg)}.actual{visibility:hidden}.show-back{animation:flip-front-to-back .8s;transform:rotateX(180deg)}.show-front{animation:flip-back-to-front .8s;transform:rotateX(0)}@keyframes flip-back-to-front{0%{transform:rotateX(180deg);box-shadow:none}10%{transform:rotateX(180deg)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(360deg)}100%{transform:rotateX(360deg);box-shadow:none}}@keyframes flip-front-to-back{0%{transform:rotateX(0);box-shadow:none}10%{transform:rotateX(0)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(180deg)}100%{transform:rotateX(180deg);box-shadow:none}}</style><span class="box"><span class="box-inner"><span class="front" aria-hidden="true"></span><span class="back" aria-hidden="true"></span><span class="actual"></span></span></span>',this.frontSpan=t.querySelector(".front"),this.backSpan=t.querySelector(".back"),this.boxInner=t.querySelector(".box-inner"),this.actualSpan=t.querySelector(".actual"),this.listener=()=>this.animationEnded()}connectedCallback(){this.connected=!0,this.boxInner.addEventListener("animationend",this.listener)}animationEnded(){this.animating=!1,this.queuedValue&&(this.updateAttributes(),this.queuedValue=null)}disconnectedCallback(){this.connected=!1,this.boxInner.removeEventListener("animationend",this.listener)}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[t]}updateAttributes(){let e=this.getAttribute(t);this.beforeValue?e!==this.beforeValue&&(this.animating?this.queuedValue=e:(this.isFront=!this.isFront,this.isFront?(this.frontSpan.innerText=e,this.boxInner.classList.remove("show-back"),this.boxInner.classList.add("show-front")):(this.backSpan.innerText=e,this.boxInner.classList.remove("show-front"),this.boxInner.classList.add("show-back")),this.connected&&(this.animating=!0),this.actualSpan.innerText=e,this.beforeValue=e)):(this.isFront=!0,this.frontSpan.innerText=e,this.backSpan.innerText="",this.boxInner.classList.remove("show-back"),this.boxInner.classList.remove("show-front"),this.beforeValue=e,this.actualSpan.innerText=e)}}customElements.define("flip-display",e);const i="time";class n extends HTMLElement{constructor(){super();let t=this.attachShadow({mode:"open"});t.innerHTML="<flip-display></flip-display><flip-display></flip-display>:<flip-display></flip-display><flip-display></flip-display>",this.digits=Array.from(t.querySelectorAll("flip-display"))}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[i]}updateAttributes(){let e=this.getAttribute(i),n=new Date(parseInt(e)),s=n.getHours(),r=n.getMinutes();this.digits[0].setAttribute(t,(s/10>>0).toString()),this.digits[1].setAttribute(t,(s%10).toString()),this.digits[2].setAttribute(t,(r/10>>0).toString()),this.digits[3].setAttribute(t,(r%10).toString())}}customElements.define("flip-time-display",n)},8159:function(t,e,i){i.r(e),i.d(e,{RouteDetails:function(){return f}});var n=i(4657),s=i(3277),r=i(708);const o=document.createElement("template");o.innerHTML='<div id="timeline-content"> <div id="timeline-element-grid"> <div id="timeline1-box"> <slot name="timeline1"></slot> </div> <div id="timeline-placeholder"> </div> <div id="timeline2-box"> <slot name="timeline2"></slot> </div> </div> <svg xmlns="http://www.w3.org/2000/svg"> <path id="timeline-path" d="M 0 0" stroke="#000" stroke-width="3"/> </svg> </div>';class a{constructor(t,e){this.svg=t,this.resizeObserver=e,this.controllerMap=new Map,this.elementsBySlot=new Map}add(t){let e=new l(t);return this.resizeObserver.observe(e.timlineElement),this.svg.appendChild(e.connection),this.controllerMap.set(t,e),e}remove(t){this.resizeObserver.unobserve(t);let e=this.controllerMap.get(t);this.svg.removeChild(e.connection),this.controllerMap.delete(t)}elementsChange(t){for(let e of this.controllerMap.keys())t.indexOf(e)<0&&this.remove(e);this.elementsBySlot=new Map;for(let e of t){let t=this.controllerMap.get(e);t||(t=this.add(e));let i,n=e.getAttribute("slot");if(i=this.elementsBySlot.get(n)){let e=this.controllerMap.get(i[i.length-1]);t.previous=this.controllerMap.get(i[i.length-1]),e.next=t}else i=[],this.elementsBySlot.set(n,i);i.push(e)}}layoutSlot(t,e,i){let n=this.elementsBySlot.get(t)||[];for(let t of n)this.controllerMap.get(t).layout(e,i)}allControllers(){return Array.from(this.controllerMap.values())}layoutTimeline(t){let e=Array.from(this.elementsBySlot.values()).map((t=>this.controllerMap.get(t[0])));if(0==e.length)return void(this.timelineHeight=0);let i=e.map((t=>+t.timlineElement.time)).sort(((t,e)=>t-e))[0];for(let e of this.elementsBySlot.keys())this.layoutSlot(e,i,t);let n=-e.sort(((t,e)=>t.boxStartPositionY-e.boxStartPositionY))[0].boxStartPositionY,s=this.allControllers();for(let t of s)t.moveAll(n);let r=Array.from(this.elementsBySlot.values()).map((t=>this.controllerMap.get(t[t.length-1])));this.timelineHeight=r.sort(((t,e)=>e.boxStartPositionY-t.boxStartPositionY))[0].boxEndPositionY}render(t){for(let e of this.allControllers())e.render(t)}}class l{get boxStartPositionY(){return this._boxStartPositionY}get boxEndPositionY(){return this._boxEndPositionY}connectionHeight(){return this._connectionPositionY-this._timePositionY}constructor(t){this.timlineElement=t,this._rendered=!1,this.connection=document.createElementNS("http://www.w3.org/2000/svg","path"),this.connection.classList.add("connection")}layout(t,e){let i=this.timlineElement.clientHeight/2,n=+this.timlineElement.time-t;if(this._timePositionY=n*e,this._boxStartPositionY=this._timePositionY-i,this._boxEndPositionY=this._boxStartPositionY+this.timlineElement.clientHeight,this._connectionPositionY=this._boxStartPositionY+i,this.moveTo=this.timlineElement.moveTo?{timeTargetPositionY:(+this.timlineElement.moveTo-t)*e,boxTargetStartPositionY:(+this.timlineElement.moveTo-t)*e-i,speedPxPerMs:e}:null,this.previous){let t=this.previous._boxEndPositionY-this._boxStartPositionY;t>0&&(this.previous.moveBox(-t/2),this.moveBox(t/2))}}moveBox(t){if(this._boxEndPositionY+=t,this._boxStartPositionY+=t,this._connectionPositionY+=t,this.moveTo&&(this.moveTo.boxTargetStartPositionY+=t),t<0&&this.previous){let t=this.previous._boxEndPositionY-this._boxStartPositionY;t>0&&this.previous.moveBox(-t)}}moveAll(t){this._boxStartPositionY+=t,this._boxEndPositionY+=t,this._timePositionY+=t,this._connectionPositionY+=t,this.moveTo&&(this.moveTo.boxTargetStartPositionY+=t,this.moveTo.timeTargetPositionY+=t)}moveTimeline(t){this._timePositionY+=t}createArc(t,e){let i=t.x+(e.x-t.x)/2;return`M ${t.x} ${t.y} C ${i} ${t.y} ${i} ${e.y} ${e.x} ${e.y}`}cancelMoveAnimations(){this.moveToBoxAnimation&&(this.moveToBoxAnimation.cancel(),this.moveToBoxAnimation=null),this.moveToConnectionAnimation&&(this.moveToConnectionAnimation.cancel(),this.moveToConnectionAnimation=null)}currentYPos(){return this.timlineElement.getBoundingClientRect().top-this.timlineElement.parentElement.getBoundingClientRect().top}render(t){if(this.cancelMoveAnimations(),this._rendered){let t=this.currentYPos();Math.abs(t-this._boxStartPositionY)>1&&(null!=this.currentShortAnimation&&this.currentShortAnimation.targetY!=this._boxStartPositionY&&(this.currentShortAnimation.animation.cancel(),console.log("canceled")),this.currentShortAnimation={animation:this.timlineElement.animate([{transform:`translateY(${t}px)`},{transform:`translateY(${this._boxStartPositionY}px)`}],{duration:200}),targetY:this._boxStartPositionY},this.currentShortAnimation.animation.addEventListener("finish",(()=>{this.currentShortAnimation=null})))}this.timlineElement.style.transform=`translateY(${this._boxStartPositionY}px)`;let e=t<this.timlineElement.offsetLeft?this.timlineElement.offsetLeft:this.timlineElement.offsetLeft+this.timlineElement.clientWidth,i=new DOMPoint(e,this._connectionPositionY),n=new DOMPoint(t,this._timePositionY);this.connection.setAttribute("d",this.createArc(i,n)),this._rendered=!0}playMoveAnimation(){this.moveTo&&(this.currentYPos(),this.moveToBoxAnimation=this.timlineElement.animate([{transform:`translateY(${this._boxStartPositionY}px)`},{transform:`translateY(${this.moveTo.boxTargetStartPositionY}px)`}],{duration:1/this.moveTo.speedPxPerMs*Math.abs(this._boxStartPositionY-this.moveTo.boxTargetStartPositionY)}),this.moveToBoxAnimation.finished.then((()=>{this.moveToBoxAnimation=null})))}}class h extends HTMLElement{onTimechange(){this.triggerLayout("timechange")}constructor(){super(),this.resizeObserver=new ResizeObserver((()=>this.resizeCallback())),this.layoutTriggered=!1,this.attachShadow({mode:"open"}),function(t,e){let i=document.createElement("style");i.innerHTML=e,t.appendChild(i)}(this.shadowRoot,r.Z),this.shadowRoot.appendChild(o.content.cloneNode(!0)),this.timelinePath=this.shadowRoot.querySelector("#timeline-path"),this.timelineContent=this.shadowRoot.querySelector("#timeline-content"),this.svg=this.shadowRoot.querySelector("svg"),this.timeline1Box=this.shadowRoot.querySelector("#timeline1-box"),this.timelinePlaceholder=this.shadowRoot.querySelector("#timeline-placeholder"),this.elementsCtrl=new a(this.svg,this.resizeObserver)}connectedCallback(){this.abortController=new AbortController,(0,s.I)(this.shadowRoot,"slotchange",(()=>this.slotchangeCallback()),this.abortController.signal),(0,s.I)(this,"timechange",(()=>this.onTimechange()),this.abortController.signal),this.resizeObserver.observe(this),this.resizeObserver.observe(this.timeline1Box)}disconnectedCallback(){this.abortController.abort(),this.resizeObserver.unobserve(this),this.resizeObserver.unobserve(this.timeline1Box)}slotchangeCallback(){this.elementsCtrl.elementsChange(Array.from(this.querySelectorAll("timeline-element"))),this.triggerLayout("slotchange")}resizeCallback(){this.triggerLayout("resize")}triggerLayout(t){this.layoutTriggered||(console.log("layout",t),this.layoutTriggered=!0,requestAnimationFrame((()=>{this.layout()})))}layout(){this.layoutTriggered=!1;let t=this.getTimelineScale();this.elementsCtrl.layoutTimeline(t),console.log("ppm",60*t*1e3);const e=this.timelinePlaceholder.offsetLeft+this.timelinePlaceholder.clientWidth/2;this.elementsCtrl.render(e),this.timelineContent.style.height=`${this.elementsCtrl.timelineHeight}px`,this.elementsCtrl.timelineHeight>0&&this.timelinePath.setAttribute("d",`M ${e} 0 L ${e} ${this.elementsCtrl.timelineHeight}`)}getTimelineScale(){let t=Array.from(this.elementsCtrl.allControllers()).map((t=>t.timlineElement));const e=2*parseFloat(getComputedStyle(this).fontSize)/6e4;if(t.length<1)return 1;if(1==t.length)return 1;let i=0;for(let n=1;n<t.length;n++){let s=+t[n].time-+t[n-1].time,r=t[n-1].clientHeight;i=0==s?e:Math.max(r/s,i)}let n=t.map((t=>+t.time)).sort(((t,e)=>t-e)),s=(n[n.length-1]-n[0])*i;const r=.65*window.innerHeight,o=1.4*window.innerHeight;return s<r?i*=r/s:(s>o&&(i*=o/s),i=Math.min(e,i)),i}}customElements.define("app-timeline",h);const d="time",c="move-to";class u extends HTMLElement{get time(){return this._time}set time(t){this.setAttribute(d,t.toISOString())}get moveTo(){return this._moveTo}set moveTo(t){this.setAttribute(c,t.toISOString())}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML="<div> <slot></slot> </div>"}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[d,c]}updateAttributes(){let t=new Date(this.getAttribute(d)),e=this.getAttribute(c),i=e?new Date(e):null;i&&isNaN(i.getTime())&&(i=null);let n=t!=this._time||i!=this._moveTo;this._time=t,this._moveTo=i,n&&this.dispatchEvent(new CustomEvent("timechange",{bubbles:!0,composed:!0}))}}customElements.define("timeline-element",u);class m extends HTMLElement{update(t){this.legs=t,this.render()}constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='<flip-time-display data-ref="timestamp"></flip-time-display> Gehen von <span data-ref="from"></span> zu <span data-ref="to"></span> (Dauer: <span data-ref="duration"></span> min)',this.fromText=this.querySelector('[data-ref="from"]'),this.toText=this.querySelector('[data-ref="to"]'),this.durationText=this.querySelector('[data-ref="duration"]'),this.timestamp=this.querySelector('[data-ref="timestamp"]'),this.rendered=!0,this.render())}disconnectedCallback(){}render(){var t;if(!this.rendered||!(null===(t=this.legs)||void 0===t?void 0:t.length))return;let e=this.legs[this.legs.length-1],i=this.legs[0];this.timestamp.setAttribute("time",`${i.plannedDeparture.getTime()}`),this.fromText.innerText=i.departureStop.stopName,this.toText.innerText=e.arrivalStop.stopName,this.durationText.innerHTML=`${Math.ceil((+e.arrivalTime-+i.plannedDeparture)/6e4)}`}}customElements.define("walking-leg-display",m),i(4203);class p extends HTMLElement{update(t){this.leg=t,this.render()}constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML="<departure-display></departure-display>",this.rendered=!0,this.departureDisplay=this.querySelector("departure-display"),this.render())}disconnectedCallback(){}render(){this.rendered&&null!=this.leg&&this.departureDisplay.update({delay:this.leg.delay,plannedDeparture:this.leg.plannedDeparture,route:this.leg.route,stop:this.leg.departureStop,tripId:this.leg.tripId,isRealtime:this.leg.isRealtime})}}customElements.define("transit-leg-display",p);class A extends HTMLElement{constructor(){super(),this.innerHTML="Ziel"}connectedCallback(){}disconnectedCallback(){}}customElements.define("timeline-goal-element",A);class b extends HTMLElement{constructor(){super(),this.rendered=!1,this.connected=!1}connectedCallback(){this.connected=!0,this.rendered||(this.rendered=!0,this.innerHTML="<flip-time-display></flip-time-display>",this.flipTimeDisplay=this.querySelector("flip-time-display")),this.refreshTime()}refreshTime(){this.flipTimeDisplay.setAttribute("time",`${(new Date).getTime()}`),this.connected&&setTimeout((()=>this.refreshTime()),1e3*(60-(new Date).getSeconds()))}disconnectedCallback(){this.connected=!1,clearTimeout(this.timeout)}}customElements.define("timeline-current-time-element",b);class g{constructor(){this.type=8}}class f extends HTMLElement{constructor(){super(),this.rendered=!1,this.refreshRegularly=!1,this.store=n.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="<app-timeline> </app-timeline>",this.timeline=this.querySelector("app-timeline"),this.rendered=!0),this.store.subscribe(((t,e)=>this.update(t,e)),this.abortController.signal),this.init(this.store.state),this.initiateRefresh(!1),(0,s.I)(window,"focus",(()=>this.initiateRefresh(!0)),this.abortController.signal),(0,s.I)(document,"focus",(()=>this.initiateRefresh(!0)),this.abortController.signal),(0,s.I)(window,"blur",(()=>this.stopRefresh()),this.abortController.signal),(0,s.I)(document,"blur",(()=>this.stopRefresh()),this.abortController.signal)}initiateRefresh(t){this.refreshRegularly||(this.refreshRegularly=!0,this.refreshRouteDetails(t))}stopRefresh(){this.refreshRegularly&&(this.refreshRegularly=!1,clearTimeout(this.refreshTimeout),this.refreshTimeout=null)}refreshRouteDetails(t){t&&this.store.postAction(new g),this.refreshTimeout=setTimeout((()=>{this.store.postAction(new g),this.refreshRegularly&&this.refreshRouteDetails(!1)}),5e3)}updateTimelineElementAndReturnNext(t,e,i,n){let s=t?e(t):null,r=t;return s||(r=new u,s=i(),r.appendChild(s),null!=t?(t.insertAdjacentElement("afterend",r),t.remove()):this.timeline.appendChild(r)),n(r,s),r.nextElementSibling}setRouteDetail(t){if(!(null==t?void 0:t.routeDetail)||!this.rendered)return;let e=[],i=t.routeDetail.itinerary,n=this.timeline.children[0];for(let t=0;t<i.legs.length;t++){let s=i.legs[t];switch(s.type){case 0:e.push(s);let r=t<i.legs.length-1?i.legs[t+1]:null;r&&0==r.type||(n=this.updateTimelineElementAndReturnNext(n,(t=>t.children[0]instanceof m?t.children[0]:null),(()=>new m),((t,i)=>{t.setAttribute("time",new Date(e[0].plannedDeparture.getTime()+1e3*s.delay).toISOString()),t.setAttribute("slot","timeline2"),i.update(e)})),e=[]);break;case 1:n=this.updateTimelineElementAndReturnNext(n,(t=>t.children[0]instanceof p?t.children[0]:null),(()=>new p),((t,e)=>{t.setAttribute("time",new Date(s.plannedDeparture.getTime()+1e3*s.delay).toISOString()),t.setAttribute("slot","timeline2"),e.update(s)}))}}let s=i.legs[i.legs.length-1];for(n=this.updateTimelineElementAndReturnNext(n,(t=>t.children[0]instanceof A?t.children[0]:null),(()=>new A),((t,e)=>{t.setAttribute("time",new Date(s.arrivalTime.getTime()+1e3*s.delay).toISOString()),t.setAttribute("slot","timeline2")})),n=this.updateTimelineElementAndReturnNext(n,(t=>t.children[0]instanceof b?t.children[0]:null),(()=>new b),((t,e)=>{t.setAttribute("time",(new Date).toISOString()),t.setAttribute("slot","timeline1")}));null!=n;){let t=n.nextElementSibling;n.remove(),n=t}}update(t,e){e.indexOf("routeDetail")>-1&&this.setRouteDetail(t)}init(t){this.setRouteDetail(t)}disconnectedCallback(){this.abortController.abort(),this.stopRefresh()}}customElements.define("route-details",f)},1807:function(t,e,i){i.d(e,{wA:function(){return n},aL:function(){return s},SA:function(){return o}});const n="route",s="route-color";class r extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<span class="transit-display__route"></span>',this.rendered=!0,this.routeLabel=this.querySelector(".transit-display__route"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[n,s]}updateAttributes(){if(!this.rendered)return;let t=this.getAttribute(n)||"";t=t.replace(/\s/g,""),this.routeLabel.classList.toggle("transit-display__route--long",t.length>3),this.routeLabel.innerText=t;let e=this.getAttribute(s);this.style.backgroundColor=e?`#${e}`:""}disconnectedCallback(){}}const o="transit-display";customElements.define(o,r)},708:function(t,e,i){var n=i(4251),s=i.n(n),r=i(8922),o=i.n(r)()(s());o.push([t.id,":root{--primary: #00e676;--background: white;--text: black;--border: #e0e0e0;--hover: #f0f0f0;--focus: #e6fff3;--text-disabled: #999999;--timeline--time:#f0f0f0;--timeline--walking:#999999;--button-background: #fff;--button-border: #999999;--button-background--hover: #f0f0f0;--button-background--active: #e0e0e0;--button-background--focus: #e6fff3}@media(prefers-color-scheme: dark){:root{--background: #383838;--text:#eeeeee;--border: #999999;--hover: #666666;--focus: #667667;--text-disabled: #999999;--timeline--time:#666666;--button-background: #383838;--button-border: #999999;--button-background--hover: #666666;--button-background--active: #555555;--button-background--focus: #667667}}:host{position:relative;display:block}svg{width:100%;height:100%;display:block;position:absolute;top:0;pointer-events:none}svg path.connection{stroke-width:.1em;stroke:var(--primary);fill:none;transition:.2s}svg path#timeline-path{stroke-width:.5em;stroke:var(--primary);transition:.2s}#timeline-placeholder{flex-basis:0px;flex-grow:1}#timeline-element-grid{display:flex}#timeline1-box{width:3em}#timeline2-box{flex-grow:9;margin-left:2em}","",{version:3,sources:["webpack://./src/theme.scss","webpack://./src/components/Timeline/Timeline.scss"],names:[],mappings:"AAKA,MACI,kBAAA,CACA,mBAAA,CACA,aAAA,CACA,iBAAA,CACA,gBAAA,CACA,gBAAA,CACA,wBAAA,CAEA,wBAAA,CACA,2BAAA,CAEA,yBAAA,CACA,wBAAA,CACA,mCAAA,CACA,oCAAA,CACA,mCAAA,CAGJ,mCACI,MACI,qBAAA,CACA,cAAA,CACA,iBAAA,CACA,gBAAA,CACA,gBAAA,CACA,wBAAA,CAEA,wBAAA,CAEA,4BAAA,CACA,wBAAA,CACA,mCAAA,CACA,oCAAA,CACA,mCAAA,CAAA,CCrCR,MACI,iBAAA,CACA,aAAA,CAGJ,IACI,UAAA,CACA,WAAA,CACA,aAAA,CAGA,iBAAA,CACA,KAAA,CACA,mBAAA,CAEA,oBACI,iBAAA,CACA,qBAAA,CACA,SAAA,CACA,cAAA,CAGJ,uBACI,iBAAA,CACA,qBAAA,CACA,cAAA,CAIR,sBACI,cAAA,CACA,WAAA,CAGJ,uBACI,YAAA,CAGJ,eACI,SAAA,CAGJ,eACI,WAAA,CACA,eAAA",sourcesContent:['@use "sass:color";\n\n$primary : #00e676;\n$focus : color.adjust($primary, $lightness: 50%);\n\n:root {\n    --primary : #{$primary};\n    --background: white;\n    --text : black;\n    --border : #e0e0e0;\n    --hover : #f0f0f0;\n    --focus: #{$focus};\n    --text-disabled : #999999;\n\n    --timeline--time:#f0f0f0;\n    --timeline--walking:#999999;\n\n    --button-background: #fff;\n    --button-border: #999999;\n    --button-background--hover: #f0f0f0;\n    --button-background--active: #e0e0e0;\n    --button-background--focus: #{$focus};    \n}\n\n@media (prefers-color-scheme: dark) {\n    :root {\n        --background: #383838;\n        --text:#eeeeee;\n        --border : #999999;\n        --hover : #666666;\n        --focus: #667667;\n        --text-disabled : #999999;\n\n        --timeline--time:#666666;\n\n        --button-background: #383838;\n        --button-border: #999999;\n        --button-background--hover: #666666;\n        --button-background--active: #555555;\n        --button-background--focus: #667667;    \n    }\n}','@import "../../theme.scss";\n\n:host {\n    position: relative;\n    display: block;\n}\n\nsvg {\n    width: 100%;\n    height: 100%;\n    display: block;\n\n    // act as a background image\n    position: absolute;\n    top: 0;\n    pointer-events: none;\n\n    path.connection {\n        stroke-width: 0.1em;\n        stroke: var(--primary);\n        fill: none;\n        transition: 0.2s;\n    }\n\n    path#timeline-path {\n        stroke-width: 0.5em;\n        stroke: var(--primary);\n        transition: 0.2s;\n    }\n}\n\n#timeline-placeholder {\n    flex-basis: 0px;\n    flex-grow: 1;\n}\n\n#timeline-element-grid {\n    display: flex;\n}\n\n#timeline1-box {\n    width: 3em;\n}\n\n#timeline2-box {\n    flex-grow: 9;\n    margin-left: 2em;\n}'],sourceRoot:""}]),e.Z=o.toString()},4242:function(t,e,i){t.exports=i.p+"d4268ce26895ae77f04d.svg"}}]);
//# sourceMappingURL=5559392def28e88f8bc0.bundle.js.map