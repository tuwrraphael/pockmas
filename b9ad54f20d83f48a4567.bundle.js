!function(){"use strict";var e,t,r,n,a={8531:function(e,t,r){r(3948),r(285),r(1637),r(5306),r(8255),r(3824);var n=r(9684);async function a(e,t,r,n){let a,i=t.body.getReader(),o=!1,s=[],u=new Uint8Array(4*r),l=0;for(;!o;){let t=await i.read();if(o=t.done,t.done)break;let p=t.value;if(0==s.length){if(u.set(p.slice(0,Math.min(4*r-l,p.byteLength)),l),l+=p.byteLength,l<4*r)continue;{let e=new DataView(u.buffer);for(let t=0;t<r;t++)s.push(e.getUint32(4*t,!0));p=p.slice(4*r-l)}}s.length>0&&null==a&&(a=n(e,s)),null!=a&&(new Uint8Array(e.exports.memory.buffer,a,p.length).set(p),a+=p.length)}}r(2472);function i(e){let t=0;return t=0==e.getDay()?64:1<<e.getDay()-1,t}class o{constructor(e,t,r){this.routingInstance=e,this.routeNames=t,this.stops=r,this.mappedRealtimeData={}}getStartOfDayVienna(e){const t=(0,n.yQ)("Europe/Vienna"),r=(0,n.iN)(e,t);return(0,n.ZG)({year:r.year,month:r.month,day:r.day,hours:0,minutes:0,seconds:0},t)}route(e){performance.mark("routing-start");let t=this.routingInstance.exports.get_request_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,168);r.setUint8(0,0),r.setUint8(1,Math.min(20,e.departureStops.length)),r.setUint8(2,1),r.setUint8(3,i(e.departureTimes[0]));for(let t=0;t<Math.min(20,e.departureStops.length);t++)r.setUint16(4+2*t,e.departureStops[t],!0);r.setUint16(44,e.arrivalStop,!0);let n=this.getStartOfDayVienna(e.departureTimes[0]),a=n/1e3;for(let t=0;t<Math.min(20,e.departureStops.length);t++){let a=(+e.departureTimes[t]-n)/1e3;r.setUint32(84+4*t,a,!0)}r.setUint32(164,a,!0);let o=this.routingInstance.exports.raptor();performance.mark("routing-done");let s=performance.measure("routing","routing-start","routing-done");return console.log("routing took ".concat(s.duration,"ms")),this.readResults(this.routingInstance.exports.memory,o,n)}async updateRealtimeForStops(e){let t=new URLSearchParams;for(let r of e)t.append("diva",r.toString());let r=await fetch("https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?".concat(t)),n=await r.json();for(let e of n.data.monitors)for(let t of e.lines){let r;if("1"==t.richtungsId)r=0;else{if("2"!=t.richtungsId)throw new Error("unknown richtungsId in monitor ".concat(t.richtungsId));r=1}let n=t.departures.departure.filter((e=>null!=e.departureTime.timeReal)).map((e=>new Date(e.departureTime.timeReal)));n.length>0&&this.upsertRealtimeData({diva:parseInt(e.locationStop.properties.name),linie:t.lineId,apply:!0,direction:r,timeReal:n})}}readLeg(e,t,r){var n;let a=new DataView(e,t,24),i=a.getUint16(4,!0),o=a.getUint16(6,!0),s=a.getUint32(8,!0),u=a.getUint32(12,!0),l={type:a.getUint32(0,!0),departureStop:{stopId:i,stopName:this.stops[i][0]},arrivalStop:{stopId:o,stopName:this.stops[o][0]},plannedDeparture:new Date(1e3*s),delay:a.getInt16(18,!0),arrivalTime:new Date(r+1e3*u),duration:1e3*(r/1e3+u-s),route:null,tripId:null,isRealtime:!1};if(1==l.type){let e=a.getUint16(16,!0);l.route={name:this.routeNames[e][0],color:this.routeNames[e].length>3?this.routeNames[e][3]:0==this.routeNames[e][2]?"c4121a":"",id:e,headsign:this.routeNames[e][1]},l.tripId=a.getUint32(20,!0),l.isRealtime=(null===(n=this.mappedRealtimeData[l.route.id])||void 0===n?void 0:n.has(l.tripId))||!1}return l}getDiva(e){return this.stops[e][1]}readItinerary(e,t,r){let n=[],a=new DataView(e,t,244).getUint32(0,!0);for(let i=0;i<a;i++)n.push(this.readLeg(e,t+4+24*i,r));return{legs:n.reverse()}}readResults(e,t,r){let n=[],a=new DataView(e.buffer,t,1956).getUint32(0,!0);for(let i=0;i<a;i++){let a=this.readItinerary(e.buffer,t+4+244*i,r);n.push(a)}return n}readStoptimeUpdate(e,t){let r=new DataView(e,t,81),n=r.getUint16(0,!0),a=r.getUint16(2,!0),i=r.getInt16(4,!0);return{routeId:n,route:this.routeNames[n][0],trip:a,realtimeOffset:i}}getRealtimeUpdateResult(){let e=this.routingInstance.exports.get_stoptime_update_memory(),t=new DataView(this.routingInstance.exports.memory.buffer,e,81),r=t.getUint8(13),n=[];for(let a=0;a<r;a++){let r=this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer,e+16+20+8*a);n.push(Object.assign(Object.assign({},r),{numMatches:t.getUint8(76+a)}))}return n}upsertRealtimeData(e){let t=this.routingInstance.exports.get_stoptime_update_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,81);r.setUint32(0,e.diva,!0),r.setUint16(4,e.linie,!0),r.setUint8(6,e.direction);let n=this.getStartOfDayVienna(e.timeReal[0]),a=i(e.timeReal[0]);r.setUint8(7,a),r.setUint32(8,n/1e3,!0),r.setUint8(12,e.apply?1:0);let o=Math.min(e.timeReal.length,5);r.setUint8(13,o);for(let t=0;t<o;t++)r.setUint32(16+4*t,(+e.timeReal[t]-n)/1e3,!0);this.routingInstance.exports.process_realtime();let s=this.getRealtimeUpdateResult();for(let e of s)e.numMatches>0&&(this.mappedRealtimeData[e.routeId]=this.mappedRealtimeData[e.routeId]||new Set,this.mappedRealtimeData[e.routeId].add(e.trip))}}let s,u,l,p=null,c=null,f=null,d="",m={arrivalStopResults:[],departureStopResults:[],results:[]};function h(e){let t=e(m);m=Object.assign(Object.assign({},m),t),self.postMessage([t,Object.keys(t)])}function g(e,t){if(null==s)return;let r,n=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(n==d)return;if(n.length==d.length+1&&n.startsWith(d))r=s.exports.stopsearch_step(n.charCodeAt(n.length-1));else{r=s.exports.stopsearch_reset();for(let e=0;e<n.length;e++)r=s.exports.stopsearch_step(n.charCodeAt(e))}d=n;let a=new DataView(s.exports.memory.buffer,r,8),i=a.getUint32(0,!0),o=a.getUint32(4,!0),u=new Uint16Array(s.exports.memory.buffer,o,i),p=[];for(let e=0;e<i;e++){let t=u[e],r=l[t];p.push({id:t,name:r.name})}h((e=>({[t?"departureStopResults":"arrivalStopResults"]:p})))}async function b(){if(null==u)return;let e=l[m.departureStopResults[c].id].stopIds,t=l[m.arrivalStopResults[f].id].stopIds[0],r=new Set;for(let n=0;n<10;n++){let n=u.route({arrivalStop:t,departureStops:e,departureTimes:e.map((()=>p))});h((()=>({results:n})));let a=n.reduce(((e,t)=>[...e,...t.legs.map((e=>u.getDiva(e.departureStop.stopId)))]),[]).filter((e=>!r.has(e)));if(0==a.length)break;await u.updateRealtimeForStops(Array.from(new Set(a).values()));for(let e of a)r.add(e)}}self.addEventListener("message",(e=>{(async function(e){switch(e.type){case 0:await async function(){if(s)return;let e=fetch(new URL(r(3369),r.b).toString()).then((e=>e.json())).then((e=>l=e)),[t,n]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(7981),r.b).toString())),fetch(new URL(r(4156),r.b).toString())]);await Promise.all([e,a(t.instance,n,4,((e,t)=>e.exports.stopsearch_allocate(t[0]/12,t[1],t[3]/2)))]),t.instance.exports.stopsearch_reset(),s=t.instance}();break;case 1:g(e.term,!0);break;case 2:g(e.term,!1);break;case 3:await async function(){if(u)return;let e=fetch(new URL(r(9826),r.b).toString()).then((e=>e.json())),t=fetch(new URL(r(3363),r.b).toString()).then((e=>e.json())),i=r.e(955).then(r.t.bind(r,6955,23)).then((e=>(0,n.wE)(e))),[s,l]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(1645),r.b).toString())),fetch(new URL(r(717),r.b).toString())]),[p,c]=await Promise.all([e,t,i,a(s.instance,l,11,((e,t)=>e.exports.raptor_allocate(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10])))]);s.instance.exports.initialize(),u=new o(s.instance,p,c)}();break;case 4:!async function(e,t){c=e,f=t,p=new Date,b()}(e.departure,e.arrival);break;case 5:!async function(e){null!=p&&(p=new Date(p.getTime()+e),null!=c&&null!=f&&b())}(e.increment)}})(e.data).catch((e=>console.error(e)))}))},717:function(e,t,r){e.exports=r.p+"data/165a4800ed552c4c8c9b.bmp"},9826:function(e,t,r){e.exports=r.p+"data/6638a393968cbb570992.json"},4156:function(e,t,r){e.exports=r.p+"data/08f2fa00ef5900145597.bmp"},3369:function(e,t,r){e.exports=r.p+"data/088bfbe83d4188f8f284.json"},3363:function(e,t,r){e.exports=r.p+"data/a85a21b1c9b591ab86be.json"},1645:function(e,t,r){e.exports=r.p+"d57ed82494720673edc8.wasm"},7981:function(e,t,r){e.exports=r.p+"b66a4079206979081fd1.wasm"}},i={};function o(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return a[e](r,r.exports,o),r.exports}o.m=a,o.x=function(){var e=o.O(void 0,[453,5],(function(){return o(8531)}));return o.O(e)},e=[],o.O=function(t,r,n,a){if(!r){var i=1/0;for(p=0;p<e.length;p++){r=e[p][0],n=e[p][1],a=e[p][2];for(var s=!0,u=0;u<r.length;u++)(!1&a||i>=a)&&Object.keys(o.O).every((function(e){return o.O[e](r[u])}))?r.splice(u--,1):(s=!1,a<i&&(i=a));if(s){e.splice(p--,1);var l=n();void 0!==l&&(t=l)}}return t}a=a||0;for(var p=e.length;p>0&&e[p-1][2]>a;p--)e[p]=e[p-1];e[p]=[r,n,a]},r=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},o.t=function(e,n){if(1&n&&(e=this(e)),8&n)return e;if("object"==typeof e&&e){if(4&n&&e.__esModule)return e;if(16&n&&"function"==typeof e.then)return e}var a=Object.create(null);o.r(a);var i={};t=t||[null,r({}),r([]),r(r)];for(var s=2&n&&e;"object"==typeof s&&!~t.indexOf(s);s=r(s))Object.getOwnPropertyNames(s).forEach((function(t){i[t]=function(){return e[t]}}));return i.default=function(){return e},o.d(a,i),a},o.d=function(e,t){for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o.f={},o.e=function(e){return Promise.all(Object.keys(o.f).reduce((function(t,r){return o.f[r](e,t),t}),[]))},o.u=function(e){return{5:"25ba1487fe8f8b80a704",453:"fd03f84bf37ee1bafe74",955:"aca8258eee8d7b804046"}[e]+".bundle.js"},o.miniCssF=function(e){},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.p="/",function(){o.b=self.location+"";var e={531:1};o.f.i=function(t,r){e[t]||importScripts(o.p+o.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],r=t.push.bind(t);t.push=function(t){var n=t[0],a=t[1],i=t[2];for(var s in a)o.o(a,s)&&(o.m[s]=a[s]);for(i&&i(o);n.length;)e[n.pop()]=1;r(t)}}(),n=o.x,o.x=function(){return Promise.all([o.e(453),o.e(5)]).then(n)},o.x()}();
//# sourceMappingURL=b9ad54f20d83f48a4567.bundle.js.map