!function(){"use strict";var e,t,r,o,n={2887:function(e,t,r){async function o(e,t,r,o){let n,i=t.body.getReader(),a=!1,s=[],u=new Uint8Array(4*r),p=0;for(;!a;){let t=await i.read();if(a=t.done,t.done)break;let l=t.value;if(0==s.length){if(u.set(l.slice(0,Math.min(4*r-p,l.byteLength)),p),p+=l.byteLength,p<4*r)continue;{let e=new DataView(u.buffer);for(let t=0;t<r;t++)s.push(e.getUint32(4*t,!0));l=l.slice(4*r-p)}}s.length>0&&null==n&&(n=o(e,s)),null!=n&&(new Uint8Array(e.exports.memory.buffer,n,l.length).set(l),n+=l.length)}}r(5306),r(3948),r(285),r(1637),r(2472),r(8012),r(3462),r(3824);var n=r(1673);class i extends Error{constructor(e,t){super("Data version mismatch - expected ".concat(e,", actual ").concat(t)),this.expected=e,this.actual=t}}class a{constructor(e){this.dataVersion=e,this.UrlVersion=1}encode(e){var t;let r=new Uint8Array(5+9*e.legs.filter((e=>1==e.type)).length+5*e.legs.filter((e=>0==e.type)).length),o=new DataView(r.buffer);o.setUint8(0,e.legs.length),o.setUint32(1,e.legs.length>0?e.legs[0].plannedDeparture.getTime()/1e3:0,!0);let i=5;for(let r of e.legs)o.setUint8(i+0,r.type),o.setUint16(i+1,r.departureStop.stopId,!0),o.setUint16(i+3,r.arrivalStop.stopId,!0),i+=5,1===r.type&&(o.setUint16(i,(null===(t=r.route)||void 0===t?void 0:t.id)||0,!0),o.setUint16(i+2,r.tripId||0,!0),i+=4);return"".concat(1).concat(n.DS.fromUint8Array(r,!0),"!").concat(this.dataVersion)}decode(e){let t=parseInt(e.substr(0,1));if(1===t)return this.decodeV1(e);throw new Error("Unsupported version ".concat(t))}decodeV1(e){let[t,r]=e.substr(1).split("!");if(r!==this.dataVersion)throw new i(this.dataVersion,r);let o=n.DS.toUint8Array(t),a=new DataView(o.buffer),s=a.getUint8(0),u=new Date(1e3*a.getUint32(1,!0)),p=[],l=5;for(let e=0;e<s;e++){let e=a.getUint8(l+0),t=a.getUint16(l+1,!0),r=a.getUint16(l+3,!0);if(l+=5,1===e){let o=a.getUint16(l,!0),n=a.getUint16(l+2,!0);l+=4,p.push({type:e,departureStopId:t,arrivalStopId:r,routeId:o,tripId:n})}else p.push({type:e,departureStopId:t,arrivalStopId:r,routeId:null,tripId:null})}return{departureTime:u,version:1,legs:p}}}class s{constructor(e,t){this.routeNames=e,this.stops=t}getDiva(e){return this.stops[e][1]}getStop(e){if(e>this.stops.length)throw new Error("Invalid stop id ".concat(e));return{stopId:e,stopName:this.stops[e][0]}}getRoute(e){if(e>this.routeNames.length)throw new Error("Invalid route id ".concat(e));return{name:this.routeNames[e][0],id:e,color:this.routeNames[e].length>3?this.routeNames[e][3]:0==this.routeNames[e][2]?"c4121a":"",headsign:this.routeNames[e][1]}}}var u=r(9684);function p(e){let t=0;return t=0==e?64:1<<e-1,t}function l(e){const t=(0,u.yQ)("Europe/Vienna"),r=(0,u.iN)(e,t);return{unixTime:(0,u.ZG)({year:r.year,month:r.month,day:r.day,hours:0,minutes:0,seconds:0},t),dayOfWeek:p(r.dayOfWeek)}}class c{constructor(e,t){this.routingInstance=e,this.routeInfoStore=t,this.mappedRealtimeData={}}getDepartures(e){var t;this.setRequest(e);let r=this.routingInstance.exports.get_departures(),o=new DataView(this.routingInstance.exports.memory.buffer,r,324),n=o.getUint32(0,!0),i=[];for(let e=0;e<n;e++){let r=this.routeInfoStore.getRoute(o.getUint16(4+16*e,!0)),n=o.getUint32(8+16*e,!0),a={route:r,stop:this.routeInfoStore.getStop(o.getUint16(6+16*e,!0)),tripId:n,plannedDeparture:new Date(1e3*o.getUint32(12+16*e,!0)),delay:o.getInt16(16+16*e,!0),isRealtime:(null===(t=this.mappedRealtimeData[r.id])||void 0===t?void 0:t.has(n))||!1};i.push(a)}return i}setRequest(e){let t=this.routingInstance.exports.get_request_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,168);r.setUint8(0,0),r.setUint8(1,Math.min(20,e.departureStops.length)),r.setUint8(2,1);let o=l(e.departureStops[0].departureTime);r.setUint8(3,o.dayOfWeek);for(let t=0;t<Math.min(20,e.departureStops.length);t++)r.setUint16(4+2*t,e.departureStops[t].stopId,!0);"number"==typeof e.arrivalStop&&r.setUint16(44,e.arrivalStop,!0);let n=o.unixTime/1e3;for(let t=0;t<Math.min(20,e.departureStops.length);t++){let n=(+e.departureStops[t].departureTime-o.unixTime)/1e3;r.setUint32(84+4*t,n,!0)}r.setUint32(164,n,!0)}route(e){if(e.departureStops.length!=e.departureTimes.length)throw new Error("departureStops and departureTimes must have the same length");performance.mark("routing-start"),this.setRequest({departureStops:e.departureStops.map(((t,r)=>({stopId:t,departureTime:e.departureTimes[r]}))),arrivalStop:e.arrivalStop});let t=this.routingInstance.exports.raptor();return performance.mark("routing-done"),performance.measure("routing","routing-start","routing-done"),console.log("routing took ".concat(performance.getEntriesByName("routing")[0].duration,"ms")),performance.clearMarks(),performance.clearMeasures(),this.readResults(this.routingInstance.exports.memory,t)}async updateRealtimeForStops(e){let t=new URLSearchParams;for(let r of e)t.append("diva",r.toString());let r=await fetch("https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?".concat(t)),o=await r.json();for(let e of o.data.monitors)for(let t of e.lines){let r;if("1"==t.richtungsId)r=0;else{if("2"!=t.richtungsId)throw new Error("unknown richtungsId in monitor ".concat(t.richtungsId));r=1}let o=t.departures.departure.filter((e=>null!=e.departureTime.timeReal)).map((e=>new Date(e.departureTime.timeReal)));o.length>0&&this.upsertRealtimeData({diva:parseInt(e.locationStop.properties.name),linie:t.lineId,apply:!0,direction:r,timeReal:o})}}readLeg(e,t){var r;let o=new DataView(e,t,24),n=o.getUint16(4,!0),i=o.getUint16(6,!0),a=o.getUint32(8,!0),s=o.getUint32(12,!0),u={type:o.getUint32(0,!0),departureStop:this.routeInfoStore.getStop(n),arrivalStop:this.routeInfoStore.getStop(i),plannedDeparture:new Date(1e3*a),delay:o.getInt16(18,!0),arrivalTime:new Date(1e3*s),duration:1e3*(s-a),route:null,tripId:null,isRealtime:!1};if(1==u.type){let e=o.getUint16(16,!0);u.route=this.routeInfoStore.getRoute(e),u.tripId=o.getUint32(20,!0),u.isRealtime=(null===(r=this.mappedRealtimeData[u.route.id])||void 0===r?void 0:r.has(u.tripId))||!1}return u}readItinerary(e,t){let r=[],o=new DataView(e,t,244).getUint32(0,!0);for(let n=0;n<o;n++)r.push(this.readLeg(e,t+4+24*n));return{legs:r.reverse()}}readResults(e,t){let r=[],o=new DataView(e.buffer,t,1956).getUint32(0,!0);for(let n=0;n<o;n++){let o=this.readItinerary(e.buffer,t+4+244*n);r.push(o)}return r}readStoptimeUpdate(e,t){let r=new DataView(e,t,81),o=r.getUint16(0,!0),n=r.getUint16(2,!0),i=r.getInt16(4,!0);return{routeId:o,route:this.routeInfoStore.getRoute(o).name,trip:n,realtimeOffset:i}}getRealtimeUpdateResult(){let e=this.routingInstance.exports.get_stoptime_update_memory(),t=new DataView(this.routingInstance.exports.memory.buffer,e,81),r=t.getUint8(13),o=[];for(let n=0;n<r;n++){let r=this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer,e+16+20+8*n);o.push(Object.assign(Object.assign({},r),{numMatches:t.getUint8(76+n)}))}return o}upsertRealtimeData(e){let t=this.routingInstance.exports.get_stoptime_update_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,81);r.setUint32(0,e.diva,!0),r.setUint16(4,e.linie,!0),r.setUint8(6,e.direction);let o=l(e.timeReal[0]);r.setUint8(7,o.dayOfWeek),r.setUint32(8,o.unixTime/1e3,!0),r.setUint8(12,e.apply?1:0);let n=Math.min(e.timeReal.length,5);r.setUint8(13,n);for(let t=0;t<n;t++)r.setUint32(16+4*t,(+e.timeReal[t]-o.unixTime)/1e3,!0);this.routingInstance.exports.process_realtime();let i=this.getRealtimeUpdateResult();for(let e of i)e.numMatches>0&&(this.mappedRealtimeData[e.routeId]=this.mappedRealtimeData[e.routeId]||new Set,this.mappedRealtimeData[e.routeId].add(e.trip))}}class d{constructor(e,t){this.routeUrlEncoder=e,this.routeInfoStore=t}getRouteByUrl(e){return{legs:this.routeUrlEncoder.decode(e).legs.map((e=>({type:e.type,departureStop:this.routeInfoStore.getStop(e.departureStopId),arrivalStop:this.routeInfoStore.getStop(e.arrivalStopId),route:1==e.type?this.routeInfoStore.getRoute(e.routeId):null,tripId:e.tripId,plannedDeparture:new Date,arrivalTime:new Date,delay:0,duration:0,isRealtime:!1})))}}}class g{constructor(e,t){this.routeInfoStore=e,this.routingService=t,this.lookedUpDivas=new Map}async performWithRealtimeLoopkup(e){for(let t=0;t<10;t++){let t=(await e()).reduce(((e,t)=>[...e,this.routeInfoStore.getDiva(t)]),[]).filter((e=>null!=e&&(!this.lookedUpDivas.has(e)||(new Date).getTime()-this.lookedUpDivas.get(e).getTime()>3e4)));if(0==t.length)break;await this.routingService.updateRealtimeForStops(Array.from(new Set(t).values()));for(let e of t)this.lookedUpDivas.set(e,new Date)}}}r(6699);class f{constructor(e){this.sstopGroupIndex=e}getStopGroup(e){if(e>this.sstopGroupIndex.length)throw new Error("Invalid stop group id ".concat(e));return this.sstopGroupIndex[e]}findByStopId(e){let t=this.sstopGroupIndex.find((t=>t.stopIds.includes(e)));return null==t?null:{id:t.stopIds.indexOf(e),name:t.name}}}let h,m=null;const S=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp",""),w=new a(S),y=new class{constructor(){this.dataVersion=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp","")}populateTimeZones(){return null==this.timezonesPromise&&(this.timezonesPromise=r.e(955).then(r.t.bind(r,6955,23)).then((e=>(0,u.wE)(e)))),this.timezonesPromise}async createRouteInfoStore(){let e=fetch(new URL(r(9826),r.b).toString()).then((e=>e.json())),t=fetch(new URL(r(3363),r.b).toString()).then((e=>e.json())),[o,n]=await Promise.all([e,t]);return new s(o,n)}async createRoutingInstance(){let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(1645),r.b).toString())),fetch(new URL(r(717),r.b).toString())]);return await o(e.instance,t,11,((e,t)=>e.exports.raptor_allocate(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]))),e.instance.exports.initialize(),e.instance}async getRoutingInstance(){return null==this.routingInstancePromise&&(this.routingInstancePromise=this.createRoutingInstance()),this.routingInstancePromise}async getRouteInfoStore(){return null==this.routeInfoStorePromise&&(this.routeInfoStorePromise=this.createRouteInfoStore()),this.routeInfoStorePromise}async createRoutingService(){let[e,t]=await Promise.all([this.getRoutingInstance(),this.getRouteInfoStore(),this.populateTimeZones()]);return new c(e,t)}async getRoutingService(){return null==this.routingServicePromise&&(this.routingServicePromise=this.createRoutingService()),this.routingServicePromise}async createRouteDetailsService(){let e=await this.getRouteInfoStore();return new d(new a(this.dataVersion),e)}async getRouteDetailsService(){return null==this.routeDetailsServicePromise&&(this.routeDetailsServicePromise=this.createRouteDetailsService()),this.routeDetailsServicePromise}async createRealtimeLookupService(){let[e,t]=await Promise.all([this.getRoutingService(),this.getRouteInfoStore()]);return new g(t,e)}async getRealtimeLookupService(){return null==this.realtimeLookupServicePromise&&(this.realtimeLookupServicePromise=this.createRealtimeLookupService()),this.realtimeLookupServicePromise}async createStopGroupStore(){let e=fetch(new URL(r(3369),r.b).toString()).then((e=>e.json()));return new f(await e)}async getStopGroupStore(){return null==this.stopGroupStorePromise&&(this.stopGroupStorePromise=this.createStopGroupStore()),this.stopGroupStorePromise}};let v="",I={arrivalStopResults:[],departureStopResults:[],results:[],routeDetail:null,departures:[],selectedStopgroups:{departure:null,arrival:null}};function b(e){let t=e(I);I=Object.assign(Object.assign({},I),t),self.postMessage([t,Object.keys(t)])}async function U(e,t){let r=await y.getStopGroupStore();if(null==h)return;let o,n=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(n==v)return;if(n.length==v.length+1&&n.startsWith(v))o=h.exports.stopsearch_step(n.charCodeAt(n.length-1));else{o=h.exports.stopsearch_reset();for(let e=0;e<n.length;e++)o=h.exports.stopsearch_step(n.charCodeAt(e))}v=n;let i=new DataView(h.exports.memory.buffer,o,8),a=i.getUint32(0,!0),s=i.getUint32(4,!0),u=new DataView(h.exports.memory.buffer,s,2*a),p=[];for(let e=0;e<a;e++){let t=u.getUint16(2*e,!0),o=r.getStopGroup(t);p.push({id:t,name:o.name})}b((e=>({[t?"departureStopResults":"arrivalStopResults"]:p})))}async function R(){if(null!=I.selectedStopgroups.arrival&&null!=I.selectedStopgroups.departure)await async function(){let e=await y.getRoutingService(),t=await y.getRealtimeLookupService(),r=await y.getStopGroupStore(),o=r.getStopGroup(I.selectedStopgroups.departure.id).stopIds,n=r.getStopGroup(I.selectedStopgroups.arrival.id).stopIds[0];await t.performWithRealtimeLoopkup((async()=>{let t=e.route({arrivalStop:n,departureStops:o,departureTimes:o.map((()=>m))});return b((()=>({results:t.map((e=>({itineraryUrlEncoded:w.encode(e),itinerary:e})))}))),t.reduce(((e,t)=>[...e,...t.legs.map((e=>e.departureStop.stopId))]),[])}))}();else if(null!=I.selectedStopgroups.departure){b((e=>({results:[]})));let e=await y.getStopGroupStore(),t=await y.getRoutingService(),r=await y.getRealtimeLookupService(),o=e.getStopGroup(I.selectedStopgroups.departure.id).stopIds;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:o.map((e=>({departureTime:m,stopId:e})))});return b((()=>({departures:e}))),e.map((e=>e.stop.stopId))}))}}self.postMessage([I,Object.keys(I)]),self.addEventListener("message",(e=>{(async function(e){switch(e.type){case 0:await async function(){if(h)return;let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(7981),r.b).toString())),fetch(new URL(r(4156),r.b).toString())]);await Promise.all([await y.getStopGroupStore(),o(e.instance,t,4,((e,t)=>e.exports.stopsearch_allocate(t[0]/12,t[1],t[3]/2)))]),e.instance.exports.stopsearch_reset(),h=e.instance}();break;case 1:U(e.term,!0);break;case 2:U(e.term,!1);break;case 3:await async function(){await y.getRoutingService()}();break;case 4:await async function(e,t){let r=await y.getStopGroupStore();b((o=>({selectedStopgroups:{departure:null==e?null:{id:e,name:r.getStopGroup(e).name},arrival:null==t?null:{id:t,name:r.getStopGroup(t).name}}}))),m=new Date,await R()}(e.departure,e.arrival);break;case 5:await async function(e){null!=m&&(m=new Date(m.getTime()+e),await R())}(e.increment);break;case 6:await async function(e){let t=await y.getRouteDetailsService(),r=await y.getStopGroupStore(),o=t.getRouteByUrl(e);b((()=>({routeDetail:{itineraryUrlEncoded:e,itinerary:o},selectedStopgroups:{departure:r.findByStopId(o.legs[0].departureStop.stopId),arrival:r.findByStopId(o.legs[o.legs.length-1].arrivalStop.stopId)}})))}(e.itineraryUrlEncoded)}})(e.data).catch((e=>console.error(e)))}))},717:function(e,t,r){e.exports=r.p+"data/9c93fe66d8f35724d034.bmp"},9826:function(e,t,r){e.exports=r.p+"data/c50c3c3bcdbfe260b54c.json"},4156:function(e,t,r){e.exports=r.p+"data/e0e48288d384036daad3.bmp"},3369:function(e,t,r){e.exports=r.p+"data/21c0ab5e4583c7d5110a.json"},3363:function(e,t,r){e.exports=r.p+"data/d5b11b2b0faa5de6e82d.json"},1645:function(e,t,r){e.exports=r.p+"bca99f7272451e1b00de.wasm"},7981:function(e,t,r){e.exports=r.p+"8e9c9e7956c6c5bf6b4e.wasm"}},i={};function a(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return n[e](r,r.exports,a),r.exports}a.m=n,a.x=function(){var e=a.O(void 0,[818,541],(function(){return a(2887)}));return a.O(e)},e=[],a.O=function(t,r,o,n){if(!r){var i=1/0;for(l=0;l<e.length;l++){r=e[l][0],o=e[l][1],n=e[l][2];for(var s=!0,u=0;u<r.length;u++)(!1&n||i>=n)&&Object.keys(a.O).every((function(e){return a.O[e](r[u])}))?r.splice(u--,1):(s=!1,n<i&&(i=n));if(s){e.splice(l--,1);var p=o();void 0!==p&&(t=p)}}return t}n=n||0;for(var l=e.length;l>0&&e[l-1][2]>n;l--)e[l]=e[l-1];e[l]=[r,o,n]},r=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},a.t=function(e,o){if(1&o&&(e=this(e)),8&o)return e;if("object"==typeof e&&e){if(4&o&&e.__esModule)return e;if(16&o&&"function"==typeof e.then)return e}var n=Object.create(null);a.r(n);var i={};t=t||[null,r({}),r([]),r(r)];for(var s=2&o&&e;"object"==typeof s&&!~t.indexOf(s);s=r(s))Object.getOwnPropertyNames(s).forEach((function(t){i[t]=function(){return e[t]}}));return i.default=function(){return e},a.d(n,i),n},a.d=function(e,t){for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.f={},a.e=function(e){return Promise.all(Object.keys(a.f).reduce((function(t,r){return a.f[r](e,t),t}),[]))},a.u=function(e){return{541:"7ab3da9dc2c605eaeffb",818:"9060e930295b90c6f220",955:"aca8258eee8d7b804046"}[e]+".bundle.js"},a.miniCssF=function(e){},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.p="/",function(){a.b=self.location+"";var e={887:1};a.f.i=function(t,r){e[t]||importScripts(a.p+a.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],r=t.push.bind(t);t.push=function(t){var o=t[0],n=t[1],i=t[2];for(var s in n)a.o(n,s)&&(a.m[s]=n[s]);for(i&&i(a);o.length;)e[o.pop()]=1;r(t)}}(),o=a.x,a.x=function(){return Promise.all([a.e(818),a.e(541)]).then(o)},a.x()}();
//# sourceMappingURL=813c858da9ba90ab529d.bundle.js.map