"use strict";(self.webpackChunkpockmas=self.webpackChunkpockmas||[]).push([[268],{5268:function(t,e,s){s.r(e),s.d(e,{RouteDetails:function(){return i}});var r=s(4657);class i extends HTMLElement{constructor(){super(),this.rendered=!1,this.store=r.y.getInstance()}connectedCallback(){this.abortController=new AbortController,this.rendered||(this.innerHTML="RouteDetails works.",this.rendered=!0),this.store.subscribe(((t,e)=>this.update(t,e)),this.abortController.signal),this.init(this.store.state)}setRouteDetail(t){if(!(null==t?void 0:t.routeDetail))return;let e="";for(let s of t.routeDetail.itinerary.legs)e+=`<div>${s.departureStop.stopName} - ${s.arrivalStop.stopName}</div>`;this.innerHTML=e}update(t,e){e.indexOf("routeDetail")>-1&&this.setRouteDetail(t)}init(t){this.setRouteDetail(t)}disconnectedCallback(){this.abortController.abort()}}customElements.define("route-details",i)}}]);
//# sourceMappingURL=7c4052a1b01d05c0c58a.bundle.js.map