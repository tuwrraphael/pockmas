"use strict";(self.webpackChunkpockmas=self.webpackChunkpockmas||[]).push([[242],{8922:function(e){e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var i="",n=void 0!==t[5];return t[4]&&(i+="@supports (".concat(t[4],") {")),t[2]&&(i+="@media ".concat(t[2]," {")),n&&(i+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),i+=e(t),n&&(i+="}"),t[2]&&(i+="}"),t[4]&&(i+="}"),i})).join("")},t.i=function(e,i,n,r,s){"string"==typeof e&&(e=[[null,e,void 0]]);var a={};if(n)for(var o=0;o<this.length;o++){var l=this[o][0];null!=l&&(a[l]=!0)}for(var d=0;d<e.length;d++){var h=[].concat(e[d]);n&&a[h[0]]||(void 0!==s&&(void 0===h[5]||(h[1]="@layer".concat(h[5].length>0?" ".concat(h[5]):""," {").concat(h[1],"}")),h[5]=s),i&&(h[2]?(h[1]="@media ".concat(h[2]," {").concat(h[1],"}"),h[2]=i):h[2]=i),r&&(h[4]?(h[1]="@supports (".concat(h[4],") {").concat(h[1],"}"),h[4]=r):h[4]="".concat(r)),t.push(h))}},t}},4251:function(e){e.exports=function(e){var t=e[1],i=e[3];if(!i)return t;if("function"==typeof btoa){var n=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),r="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(n),s="/*# ".concat(r," */");return[t].concat([s]).join("\n")}return[t].join("\n")}},542:function(e){e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),t.hash&&(e+=t.hash),t.maybeNeedQuotes&&/[\t\n\f\r "'=<>`]/.test(e)?'"'.concat(e,'"'):e):e}},4203:function(e,t,i){var n=i(542),r=i.n(n),s=new URL(i(4242),i.b),a='<div class="departure-display__departure"> <flip-time-display class="departure-display__departure-time"></flip-time-display> <div> <transit-display class="departure-display__departure-line"></transit-display> </div> <span class="departure-display__departure-headsign"></span> <span class="departure-display__planned-time"></span> <span class="departure-display__departure-stop-display"> <img class="departure-display__departure-stop-img" src="'+r()(s)+'" alt="Abfahrtsstation">Abfahrt: <span class="departure-display__departure-stop"></span> </span> </div>',o=(i(2208),i(1807));const l=Intl.DateTimeFormat([],{hour:"2-digit",minute:"2-digit"});class d extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML=a,this.rendered=!0,this.departureTime=this.querySelector(".departure-display__departure-time"),this.plannedTime=this.querySelector(".departure-display__planned-time"),this.departureLine=this.querySelector(".departure-display__departure-line"),this.departureStop=this.querySelector(".departure-display__departure-stop"),this.departureHeadsign=this.querySelector(".departure-display__departure-headsign")),this.render()}render(){var e,t,i,n;if(this.rendered&&this.nextDeparture){if((null===(e=this.renderedDeparture)||void 0===e?void 0:e.plannedDeparture)!==this.nextDeparture.plannedDeparture||(null===(t=this.renderedDeparture)||void 0===t?void 0:t.delay)!==this.nextDeparture.delay||this.renderedDeparture.isRealtime!==this.nextDeparture.isRealtime){let e=new Date(this.nextDeparture.plannedDeparture.getTime()+1e3*this.nextDeparture.delay),t=l.format(e);this.departureTime.setAttribute("time",""+e.getTime()),this.departureTime.setAttribute("title",`Abfahrt um ${t}`);let i=l.format(this.nextDeparture.plannedDeparture),n=i!=t;this.plannedTime.innerText=`${this.nextDeparture.isRealtime?n?i:"pünktlich":""}`,this.plannedTime.style.textDecoration=n?"line-through":"none"}(null===(i=this.renderedDeparture)||void 0===i?void 0:i.route.id)!==this.nextDeparture.route.id&&(this.departureLine.setAttribute(o.wA,this.nextDeparture.route.name),this.departureLine.setAttribute(o.aL,this.nextDeparture.route.color),this.departureHeadsign.innerText=this.nextDeparture.route.headsign),(null===(n=this.renderedDeparture)||void 0===n?void 0:n.stop.stopId)!==this.nextDeparture.stop.stopId&&(this.departureStop.innerText=this.nextDeparture.stop.stopName)}this.renderedDeparture=this.nextDeparture}update(e){this.nextDeparture=e,this.render()}disconnectedCallback(){this.abortController.abort()}}customElements.define("departure-display",d)},2208:function(){const e="text";class t extends HTMLElement{constructor(){super(),this.isFront=!0,this.beforeValue=null,this.animating=!1,this.connected=!1,this.queuedValue=null;let e=this.attachShadow({mode:"open"});e.innerHTML='<style>.box{perspective:5em;display:inline-block}.box-inner{transform-style:preserve-3d;display:inline-block;position:relative;border-radius:2px;transition:transform,box-shadow;animation-timing-function:ease-in-out}.back,.front{backface-visibility:hidden;display:inline-block;position:absolute;left:0}.front{transform:rotateX(0)}.back{transform:rotateX(180deg)}.actual{visibility:hidden}.show-back{animation:flip-front-to-back .8s;transform:rotateX(180deg)}.show-front{animation:flip-back-to-front .8s;transform:rotateX(0)}@keyframes flip-back-to-front{0%{transform:rotateX(180deg);box-shadow:none}10%{transform:rotateX(180deg)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(360deg)}100%{transform:rotateX(360deg);box-shadow:none}}@keyframes flip-front-to-back{0%{transform:rotateX(0);box-shadow:none}10%{transform:rotateX(0)}50%{box-shadow:0 0 0 -1px rgb(0 0 0 / 20%),0 0 5px 0 rgb(0 0 0 / 14%),0 0 10px 0 rgb(0 0 0 / 12%)}90%{transform:rotateX(180deg)}100%{transform:rotateX(180deg);box-shadow:none}}</style><span class="box"><span class="box-inner"><span class="front" aria-hidden="true"></span><span class="back" aria-hidden="true"></span><span class="actual"></span></span></span>',this.frontSpan=e.querySelector(".front"),this.backSpan=e.querySelector(".back"),this.boxInner=e.querySelector(".box-inner"),this.actualSpan=e.querySelector(".actual"),this.listener=()=>this.animationEnded()}connectedCallback(){this.connected=!0,this.boxInner.addEventListener("animationend",this.listener)}animationEnded(){this.animating=!1,this.queuedValue&&(this.updateAttributes(),this.queuedValue=null)}disconnectedCallback(){this.connected=!1,this.boxInner.removeEventListener("animationend",this.listener)}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[e]}updateAttributes(){let t=this.getAttribute(e);this.beforeValue?t!==this.beforeValue&&(this.animating?this.queuedValue=t:(this.isFront=!this.isFront,this.isFront?(this.frontSpan.innerText=t,this.boxInner.classList.remove("show-back"),this.boxInner.classList.add("show-front")):(this.backSpan.innerText=t,this.boxInner.classList.remove("show-front"),this.boxInner.classList.add("show-back")),this.connected&&(this.animating=!0),this.actualSpan.innerText=t,this.beforeValue=t)):(this.isFront=!0,this.frontSpan.innerText=t,this.backSpan.innerText="",this.boxInner.classList.remove("show-back"),this.boxInner.classList.remove("show-front"),this.beforeValue=t,this.actualSpan.innerText=t)}}customElements.define("flip-display",t);const i="time";class n extends HTMLElement{constructor(){super();let e=this.attachShadow({mode:"open"});e.innerHTML="<flip-display></flip-display><flip-display></flip-display>:<flip-display></flip-display><flip-display></flip-display>",this.digits=Array.from(e.querySelectorAll("flip-display"))}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[i]}updateAttributes(){let t=this.getAttribute(i),n=new Date(parseInt(t)),r=n.getHours(),s=n.getMinutes();this.digits[0].setAttribute(e,(r/10>>0).toString()),this.digits[1].setAttribute(e,(r%10).toString()),this.digits[2].setAttribute(e,(s/10>>0).toString()),this.digits[3].setAttribute(e,(s%10).toString())}}customElements.define("flip-time-display",n)},242:function(e,t,i){i.r(t),i.d(t,{RouteDetails:function(){return A}});var n=i(4657),r=i(6029);i(4203);class s extends HTMLElement{update(e){this.leg=e,this.render()}constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML="<departure-display></departure-display>",this.rendered=!0,this.departureDisplay=this.querySelector("departure-display"),this.render())}disconnectedCallback(){}render(){this.rendered&&null!=this.leg&&this.departureDisplay.update({delay:this.leg.delay,plannedDeparture:this.leg.plannedDeparture,route:this.leg.route,stop:this.leg.departureStop,tripId:this.leg.tripId,isRealtime:this.leg.isRealtime})}}customElements.define("transit-leg-display",s);class a extends HTMLElement{update(e){this.leg=e,this.render()}constructor(){super()}connectedCallback(){this.rendered||(this.innerHTML='Gehen von <span data-ref="from"></span> zu <span data-ref="to"></span> (Dauer: <span data-ref="duration"></span> min)',this.fromText=this.querySelector('[data-ref="from"]'),this.toText=this.querySelector('[data-ref="to"]'),this.durationText=this.querySelector('[data-ref="duration"]'),this.rendered=!0,this.render())}disconnectedCallback(){}render(){this.rendered&&null!=this.leg&&(this.fromText.innerText=this.leg.departureStop.stopName,this.toText.innerText=this.leg.arrivalStop.stopName,this.durationText.innerHTML=`${Math.ceil((+this.leg.arrivalTime-+this.leg.plannedDeparture)/6e4)}`)}}customElements.define("walk-leg-display",a);class o extends HTMLElement{update(e){this.leg=e,this.render()}constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<div data-ref="leg-display-container"> </div>',this.rendered=!0,this.legDisplayContainer=this.querySelector('[data-ref="leg-display-container"]'),this.render())}disconnectedCallback(){}render(){this.rendered&&null!=this.leg&&(1==this.leg.type?(null==this.transitLegDisplay&&(this.legDisplayContainer.innerHTML="",this.transitLegDisplay=new s,this.legDisplayContainer.appendChild(this.transitLegDisplay)),this.transitLegDisplay.update(this.leg)):0==this.leg.type&&(null==this.walkLegDisplay&&(this.legDisplayContainer.innerHTML="",this.walkLegDisplay=new a,this.legDisplayContainer.appendChild(this.walkLegDisplay)),this.walkLegDisplay.update(this.leg)))}}customElements.define("leg-display",o);var l=i(3277),d=i(708);const h=document.createElement("template");h.innerHTML='<div id="timeline-content"> <div id="timeline-element-grid"> <div id="timeline1-box"> <slot name="timeline1"></slot> </div> <div id="timeline-placeholder"> </div> <div id="timeline2-box"> <slot name="timeline2"></slot> </div> </div> <svg xmlns="http://www.w3.org/2000/svg"> <path id="timeline-path" d="M 0 0" stroke="#000" stroke-width="3"/> </svg> </div>';const u=20/6e4;class c extends HTMLElement{onTimechange(){this.triggerLayout("timechange")}constructor(){super(),this.timeLineElements=[],this.resizeObserver=new ResizeObserver((()=>this.resizeCallback())),this.arrows=new Map,this.layoutTriggered=!1,this.attachShadow({mode:"open"}),function(e,t){let i=document.createElement("style");i.innerHTML=t,e.appendChild(i)}(this.shadowRoot,d.Z),this.shadowRoot.appendChild(h.content.cloneNode(!0)),this.timelinePath=this.shadowRoot.querySelector("#timeline-path"),this.timelineContent=this.shadowRoot.querySelector("#timeline-content"),this.svg=this.shadowRoot.querySelector("svg"),this.timeline1Box=this.shadowRoot.querySelector("#timeline1-box"),this.timelinePlaceholder=this.shadowRoot.querySelector("#timeline-placeholder")}connectedCallback(){this.abortController=new AbortController,(0,l.I)(this.shadowRoot,"slotchange",(()=>this.slotchangeCallback()),this.abortController.signal),(0,l.I)(this,"timechange",(()=>this.onTimechange()),this.abortController.signal),this.resizeObserver.observe(this),this.resizeObserver.observe(this.timeline1Box)}disconnectedCallback(){this.abortController.abort(),this.resizeObserver.unobserve(this),this.resizeObserver.unobserve(this.timeline1Box)}createArrow(){let e=document.createElementNS("http://www.w3.org/2000/svg","path");return e.classList.add("connection"),this.svg.appendChild(e),e}slotchangeCallback(){let e=Array.from(this.querySelectorAll("timeline-element"));for(let t of this.timeLineElements)if(e.indexOf(t)<0){this.resizeObserver.unobserve(t);let e=this.arrows.get(t);this.svg.removeChild(e),this.arrows.delete(t)}for(let t of e)this.timeLineElements.indexOf(t)<0&&(this.resizeObserver.observe(t),this.arrows.set(t,this.createArrow()));this.timeLineElements=e,this.triggerLayout("slotchange")}resizeCallback(){this.triggerLayout("resize")}createArc(e,t){let i=e.x+(t.x-e.x)/2;return`M ${e.x} ${e.y} C ${i} ${e.y} ${i} ${t.y} ${t.x} ${t.y}`}triggerLayout(e){this.layoutTriggered||(console.log("layout",e),this.layoutTriggered=!0,requestAnimationFrame((()=>{this.layout()})))}layout(){if(this.layoutTriggered=!1,0==this.timeLineElements.length)return void(this.timelineContent.style.height="0px");let e=this.getTimelineScale(this.timeLineElements);console.log(e);const t=this.timelinePlaceholder.offsetLeft+this.timelinePlaceholder.clientWidth/2;let i=[],n=[],r=[],s=[];for(let t of this.timeLineElements){let a=t.clientHeight/2,o=(+t.time-+this.timeLineElements[0].time)*e.scale;r.push(o);let l=o-a,d=l-n[n.length-1];if(d<0){l-=d/2;let e=d/2;for(let t=i.length-1;t>=0&&(i[t]+=e,n[t]+=e,s[t]+=e,t>0&&(e=i[t]-n[t-1]),!(e>0));t--);}i.push(l),n.push(l+t.clientHeight),s.push(l+a)}let a=i[0];i=i.map((e=>e-a)),s=s.map((e=>e-a)),r=r.map((e=>e-a));let o=function(e){e.sort(((e,t)=>e-t));let t=Math.floor(e.length/2);return e.length%2?e[t]:(e[t-1]+e[t])/2}(r.map(((e,t)=>s[t]-e)));for(let e=0;e<this.timeLineElements.length;e++){let n=this.timeLineElements[e];n.style.transform=`translateY(${i[e]}px)`,""==n.style.transition&&requestAnimationFrame((()=>{n.style.transition="0.2s linear"}));let a=this.arrows.get(n),l={x:n.offsetLeft,y:s[e]},d={x:t,y:r[e]+o};a.setAttribute("d",this.createArc(l,d))}this.timelineContent.style.height=n[n.length-1]-a+"px",this.timelinePath.setAttribute("d",`M ${t} 0 L ${t} ${n[n.length-1]-a}`)}getTimelineScale(e){if(e.length<1)return{size:0,scale:1};if(1==e.length)return{size:e[0].clientHeight,scale:1};let t=0;for(let i=1;i<e.length;i++){let n=+e[i].time-+e[i-1].time,r=e[i-1].clientHeight;t=Math.min(u,Math.max(r/n,t))}let i=this.timeLineElements.map((e=>+e.time)).sort(((e,t)=>e-t)),n=(i[i.length-1]-i[0])*t;const r=.7*window.innerHeight,s=1.4*window.innerHeight;return n<r?t=Math.min(u,r/n*t):n>s&&(t*=s/n),{scale:t}}}customElements.define("app-timeline",c);const p="time";class m extends HTMLElement{get time(){return this._time}set time(e){this.setAttribute(p,e.toISOString())}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML="<div> <slot></slot> </div>"}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[p]}updateAttributes(){let e=new Date(this.getAttribute(p)),t=e!=this._time;this._time=e,t&&this.dispatchEvent(new CustomEvent("timechange",{bubbles:!0,composed:!0}))}}customElements.define("timeline-element",m);class A extends HTMLElement{constructor(){super(),this.rendered=!1,this.store=n.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="<app-timeline> </app-timeline>",this.renderer=new r.T(document.querySelector("app-timeline"),((e,t)=>t),(e=>{let t=new m;return t.appendChild(new o),t})),this.rendered=!0),this.store.subscribe(((e,t)=>this.update(e,t)),this.abortController.signal),this.init(this.store.state)}setRouteDetail(e){(null==e?void 0:e.routeDetail)&&this.rendered&&(console.log(e.routeDetail),this.renderer.update(e.routeDetail.itinerary.legs,((e,t)=>{e.setAttribute("time",new Date(t.plannedDeparture.getTime()+1e3*t.delay).toISOString()),e.setAttribute("slot","timeline2"),e.children[0].update(t)})))}update(e,t){t.indexOf("routeDetail")>-1&&this.setRouteDetail(e)}init(e){this.setRouteDetail(e)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-details",A)},1807:function(e,t,i){i.d(t,{wA:function(){return n},aL:function(){return r},SA:function(){return a}});const n="route",r="route-color";class s extends HTMLElement{constructor(){super(),this.rendered=!1}connectedCallback(){this.rendered||(this.innerHTML='<span class="transit-display__route"></span>',this.rendered=!0,this.routeLabel=this.querySelector(".transit-display__route"),this.updateAttributes())}attributeChangedCallback(){this.updateAttributes()}static get observedAttributes(){return[n,r]}updateAttributes(){if(!this.rendered)return;let e=this.getAttribute(n)||"";e=e.replace(/\s/g,""),this.routeLabel.classList.toggle("transit-display__route--long",e.length>3),this.routeLabel.innerText=e;let t=this.getAttribute(r);this.style.backgroundColor=t?`#${t}`:""}disconnectedCallback(){}}const a="transit-display";customElements.define(a,s)},6029:function(e,t,i){i.d(t,{T:function(){return n}});class n{constructor(e,t,i){this.listElement=e,this.keySelector=t,this.createElement=i,this.keyToElement=new Map,this.elementToKey=new WeakMap}update(e,t){let i=new Map,n=(e,t)=>i.get(e)||(()=>{let n=this.keySelector(e,t);return i.set(e,n),n})();for(let i of Array.from(this.listElement.children)){let r=i,s=e.find(((e,t)=>this.elementToKey.get(r)==n(e,t)));s?t(r,s):this.listElement.removeChild(r)}let r=null,s=new Map;for(let i=0;i<e.length;i++){let a=e[i],o=n(a,i),l=this.keyToElement.get(o);l||(l=this.createElement(a),t(l,a),this.elementToKey.set(l,o)),s.set(o,l),null==r&&l!=this.listElement.firstElementChild?this.listElement.prepend(l):null!=r&&r.nextElementSibling!=l&&r.insertAdjacentElement("afterend",l),r=l}this.keyToElement=s}}},708:function(e,t,i){var n=i(4251),r=i.n(n),s=i(8922),a=i.n(s)()(r());a.push([e.id,":root{--primary: #00e676;--background: white;--text: black;--border: #e0e0e0;--hover: #f0f0f0;--focus: #e6fff3;--text-disabled: #999999;--timeline--time:#f0f0f0;--timeline--walking:#999999;--button-background: #fff;--button-border: #999999;--button-background--hover: #f0f0f0;--button-background--active: #e0e0e0;--button-background--focus: #e6fff3}@media(prefers-color-scheme: dark){:root{--background: #383838;--text:#eeeeee;--border: #999999;--hover: #666666;--focus: #667667;--text-disabled: #999999;--timeline--time:#666666;--button-background: #383838;--button-border: #999999;--button-background--hover: #666666;--button-background--active: #555555;--button-background--focus: #667667}}:host{position:relative;display:block}svg{width:100%;height:100%;display:block;position:absolute;top:0;pointer-events:none}svg path.connection{stroke-width:.1em;stroke:var(--primary);fill:none;transition:.2s}svg path#timeline-path{stroke-width:.5em;stroke:var(--primary);transition:.2s}#timeline-placeholder{flex-basis:0px;flex-grow:1}#timeline-element-grid{display:flex}#timeline1-box{width:3em}#timeline2-box{flex-grow:9;margin-left:2em}","",{version:3,sources:["webpack://./src/theme.scss","webpack://./src/components/Timeline/Timeline.scss"],names:[],mappings:"AAKA,MACI,kBAAA,CACA,mBAAA,CACA,aAAA,CACA,iBAAA,CACA,gBAAA,CACA,gBAAA,CACA,wBAAA,CAEA,wBAAA,CACA,2BAAA,CAEA,yBAAA,CACA,wBAAA,CACA,mCAAA,CACA,oCAAA,CACA,mCAAA,CAGJ,mCACI,MACI,qBAAA,CACA,cAAA,CACA,iBAAA,CACA,gBAAA,CACA,gBAAA,CACA,wBAAA,CAEA,wBAAA,CAEA,4BAAA,CACA,wBAAA,CACA,mCAAA,CACA,oCAAA,CACA,mCAAA,CAAA,CCrCR,MACI,iBAAA,CACA,aAAA,CAGJ,IACI,UAAA,CACA,WAAA,CACA,aAAA,CAGA,iBAAA,CACA,KAAA,CACA,mBAAA,CAEA,oBACI,iBAAA,CACA,qBAAA,CACA,SAAA,CACA,cAAA,CAGJ,uBACI,iBAAA,CACA,qBAAA,CACA,cAAA,CAIR,sBACI,cAAA,CACA,WAAA,CAGJ,uBACI,YAAA,CAGJ,eACI,SAAA,CAGJ,eACI,WAAA,CACA,eAAA",sourcesContent:['@use "sass:color";\n\n$primary : #00e676;\n$focus : color.adjust($primary, $lightness: 50%);\n\n:root {\n    --primary : #{$primary};\n    --background: white;\n    --text : black;\n    --border : #e0e0e0;\n    --hover : #f0f0f0;\n    --focus: #{$focus};\n    --text-disabled : #999999;\n\n    --timeline--time:#f0f0f0;\n    --timeline--walking:#999999;\n\n    --button-background: #fff;\n    --button-border: #999999;\n    --button-background--hover: #f0f0f0;\n    --button-background--active: #e0e0e0;\n    --button-background--focus: #{$focus};    \n}\n\n@media (prefers-color-scheme: dark) {\n    :root {\n        --background: #383838;\n        --text:#eeeeee;\n        --border : #999999;\n        --hover : #666666;\n        --focus: #667667;\n        --text-disabled : #999999;\n\n        --timeline--time:#666666;\n\n        --button-background: #383838;\n        --button-border: #999999;\n        --button-background--hover: #666666;\n        --button-background--active: #555555;\n        --button-background--focus: #667667;    \n    }\n}','@import "../../theme.scss";\n\n:host {\n    position: relative;\n    display: block;\n}\n\nsvg {\n    width: 100%;\n    height: 100%;\n    display: block;\n\n    // act as a background image\n    position: absolute;\n    top: 0;\n    pointer-events: none;\n\n    path.connection {\n        stroke-width: 0.1em;\n        stroke: var(--primary);\n        fill: none;\n        transition: 0.2s;\n    }\n\n    path#timeline-path {\n        stroke-width: 0.5em;\n        stroke: var(--primary);\n        transition: 0.2s;\n    }\n}\n\n#timeline-placeholder {\n    flex-basis: 0px;\n    flex-grow: 1;\n}\n\n#timeline-element-grid {\n    display: flex;\n}\n\n#timeline1-box {\n    width: 3em;\n}\n\n#timeline2-box {\n    flex-grow: 9;\n    margin-left: 2em;\n}'],sourceRoot:""}]),t.Z=a.toString()},4242:function(e,t,i){e.exports=i.p+"d4268ce26895ae77f04d.svg"}}]);
//# sourceMappingURL=ac4ecc404598959918ed.bundle.js.map