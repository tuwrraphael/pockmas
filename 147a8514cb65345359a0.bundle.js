!function(){"use strict";var e,t,r={5974:function(e,t,r){async function o(e,t,r,o){let i,n=t.body.getReader(),a=!1,s=[],l=new Uint8Array(4*r),u=0;for(;!a;){let t=await n.read();if(a=t.done,t.done)break;let p=t.value;if(0==s.length){if(l.set(p.slice(0,Math.min(4*r-u,p.byteLength)),u),u+=p.byteLength,u<4*r)continue;{let e=new DataView(l.buffer);for(let t=0;t<r;t++)s.push(e.getUint32(4*t,!0));p=p.slice(4*r-u)}}s.length>0&&null==i&&(i=o(e,s)),null!=i&&(new Uint8Array(e.exports.memory.buffer,i,p.length).set(p),i+=p.length)}}r(5306),r(3948),r(285),r(1637),r(2472),r(8012),r(3105),r(3462),r(3824);var i=r(1673);class n extends Error{constructor(e,t){super("Data version mismatch - expected ".concat(e,", actual ").concat(t)),this.expected=e,this.actual=t}}class a{constructor(e){this.dataVersion=e,this.UrlVersion=1}encode(e){var t;let r=new Uint8Array(5+9*e.legs.filter((e=>1==e.type)).length+5*e.legs.filter((e=>0==e.type)).length),o=new DataView(r.buffer);o.setUint8(0,e.legs.length),o.setUint32(1,e.legs.length>0?e.legs[0].plannedDeparture.getTime()/1e3:0,!0);let n=5;for(let r of e.legs)o.setUint8(n+0,r.type),o.setUint16(n+1,r.departureStop.stopId,!0),o.setUint16(n+3,r.arrivalStop.stopId,!0),n+=5,1===r.type&&(o.setUint16(n,(null===(t=r.route)||void 0===t?void 0:t.id)||0,!0),o.setUint16(n+2,r.tripId||0,!0),n+=4);return"".concat(1).concat(i.DS.fromUint8Array(r,!0),"!").concat(this.dataVersion)}decode(e){let t=parseInt(e.substr(0,1));if(1===t)return this.decodeV1(e);throw new Error("Unsupported version ".concat(t))}decodeV1(e){let[t,r]=e.substr(1).split("!");if(r!==this.dataVersion)throw new n(this.dataVersion,r);let o=i.DS.toUint8Array(t),a=new DataView(o.buffer),s=a.getUint8(0),l=new Date(1e3*a.getUint32(1,!0)),u=[],p=5;for(let e=0;e<s;e++){let e=a.getUint8(p+0),t=a.getUint16(p+1,!0),r=a.getUint16(p+3,!0);if(p+=5,1===e){let o=a.getUint16(p,!0),i=a.getUint16(p+2,!0);p+=4,u.push({type:e,departureStopId:t,arrivalStopId:r,routeId:o,tripId:i})}else u.push({type:e,departureStopId:t,arrivalStopId:r,routeId:null,tripId:null})}return{departureTime:l,version:1,legs:u}}}class s{constructor(e,t,r,o){this.routes=e,this.routeClasses=t,this.routeClassesByRealtimeIdentifier=r,this.stops=o}getRealtimeIdentifier(e){return this.stops[e].length<1?null:{type:this.stops[e][1],value:this.stops[e][2]}}getStop(e){if(e>this.stops.length)throw new Error("Invalid stop id ".concat(e));return{stopId:e,stopName:this.stops[e][0]}}getRoute(e){if(e>this.routes.length)throw new Error("Invalid route id ".concat(e));let t=this.routes[e],r=this.routeClasses[t[0]],o="";return r.routeColor?o=r.routeColor:0==r.routeType&&(o="c4121a"),{name:this.routeClasses[t[0]].routeClassName,id:e,color:o,headsign:r.headsignVariants[t[1]]}}getRouteClassesFotRealtimeIdentifier(e){let t=e.type,r=e.value;return this.routeClassesByRealtimeIdentifier.find((e=>e[0]==t&&e[1]==r)).slice(2).map((e=>({routeClassName:this.routeClasses[e].routeClassName,headsignVariants:this.routeClasses[e].headsignVariants,id:e})))}}var l=r(606);class u{constructor(e){this.tz=e}getTimezone(){return this.timezone||(this.timezone=(0,l.yQ)(this.tz)),this.timezone}dayOfWeekToMask(e){let t=0;return t=0==e?64:1<<e-1,t}getStartOfDay(e){const t=(0,l.iN)(e,this.getTimezone());return{unixTime:(0,l.ZG)({year:t.year,month:t.month,day:t.day,hours:0,minutes:0,seconds:0},this.getTimezone()),dayOfWeek:this.dayOfWeekToMask(t.dayOfWeek)}}getDateInTimezone(e,t,r,o,i,n){return new Date((0,l.ZG)({year:e,month:t,day:r,hours:o,minutes:i,seconds:n},this.getTimezone()))}}var p=r(4538),c=function(e){return this instanceof c?(this.v=e,this):new c(e)};class d{constructor(e,t){this.routingInstance=e,this.routeInfoStore=t,this.mappedRealtimeData={},this.timezoneUtility=new u("Europe/Vienna")}getDepartures(e){var t;this.setRequest(e);let r=this.routingInstance.exports.get_departures(),o=new DataView(this.routingInstance.exports.memory.buffer,r,164),i=o.getUint32(0,!0),n=[];for(let e=0;e<i;e++){let r=this.routeInfoStore.getRoute(o.getUint16(4+16*e,!0)),i=o.getUint32(8+16*e,!0),a={route:r,stop:this.routeInfoStore.getStop(o.getUint16(6+16*e,!0)),tripId:i,plannedDeparture:new Date(1e3*o.getUint32(12+16*e,!0)),delay:o.getInt16(16+16*e,!0),isRealtime:(null===(t=this.mappedRealtimeData[r.id])||void 0===t?void 0:t.has(i))||!1};n.push(a)}return n}setRequest(e){let t=this.routingInstance.exports.get_request_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,168);r.setUint8(0,0),r.setUint8(1,Math.min(20,e.departureStops.length)),r.setUint8(2,1);let o=this.timezoneUtility.getStartOfDay(e.departureStops[0].departureTime);r.setUint8(3,o.dayOfWeek);for(let t=0;t<Math.min(20,e.departureStops.length);t++)r.setUint16(4+2*t,e.departureStops[t].stopId,!0);"number"==typeof e.arrivalStop&&r.setUint16(44,e.arrivalStop,!0);let i=o.unixTime/1e3;for(let t=0;t<Math.min(20,e.departureStops.length);t++){let i=(+e.departureStops[t].departureTime-o.unixTime)/1e3;r.setUint32(84+4*t,i,!0)}r.setUint32(164,i,!0)}route(e){if(e.departureStops.length!=e.departureTimes.length)throw new Error("departureStops and departureTimes must have the same length");performance.mark("routing-start"),this.setRequest({departureStops:e.departureStops.map(((t,r)=>({stopId:t,departureTime:e.departureTimes[r]}))),arrivalStop:e.arrivalStop});let t=this.routingInstance.exports.raptor();return performance.mark("routing-done"),performance.measure("routing","routing-start","routing-done"),console.log("routing took ".concat(performance.getEntriesByName("routing")[0].duration,"ms")),performance.clearMarks(),performance.clearMeasures(),this.readResults(this.routingInstance.exports.memory,t)}async getRealtimeForWienerLinien(e){var t,r,o,i,n,a;let s=new URLSearchParams;for(let t of e)s.append("diva",t.toString());let l=await fetch("https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?".concat(s)),u=await l.json(),p=[];for(let e of u.data.monitors){let s={type:0,value:parseInt(e.locationStop.properties.name)};for(let l of e.lines){let e=new Map;for(let s of l.departures.departure)if((null===(t=s.departureTime)||void 0===t?void 0:t.timeReal)||(null===(r=s.departureTime)||void 0===r?void 0:r.timePlanned)){let t=e.get((null===(o=s.vehicle)||void 0===o?void 0:o.name)||l.name)||new Map,r=s.departureTime.timeReal?new Date(s.departureTime.timeReal):new Date(s.departureTime.timePlanned),u=t.get((null===(i=s.vehicle)||void 0===i?void 0:i.towards)||l.towards)||[];u.push(r),t.set((null===(n=s.vehicle)||void 0===n?void 0:n.towards)||l.towards,u),e.set((null===(a=s.vehicle)||void 0===a?void 0:a.name)||l.name,t)}else console.log("no departure time in departure",s);for(let[t,r]of e)for(let[e,o]of r){let r={realtimeIdentifier:s,routeClassName:t,headsign:e,times:o};p.push(r)}}}return p}parseOebbDate(e,t){if(!(e&&t&&/^(\d{2})\.(\d{2})\.(\d{4})$/.test(e)&&/^(\d{2}):(\d{2})$/.test(t)))return console.log('unexpected oebb date or time: "'.concat(e,'" "').concat(t,'"')),null;let r=e.split("."),o=t.split(":");return this.timezoneUtility.getDateInTimezone(+r[2],+r[1],+r[0],+o[0],+o[1],0)}getRealtimeForOebb(e){return function(e,t,r){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var o,i=r.apply(e,t||[]),n=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(e){i[e]&&(o[e]=function(t){return new Promise((function(r,o){n.push([e,t,r,o])>1||s(e,t)}))})}function s(e,t){try{(r=i[e](t)).value instanceof c?Promise.resolve(r.value.v).then(l,u):p(n[0][2],r)}catch(e){p(n[0][3],e)}var r}function l(e){s("next",e)}function u(e){s("throw",e)}function p(e,t){e(t),n.shift(),n.length&&s(n[0][0],n[0][1])}}(this,arguments,(function*(){for(let t of e){let e=yield c(fetch("https://realtime-api.grapp.workers.dev/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=".concat(t,"&boardType=dep&productsFilter=1011111111011&additionalTime=0&disableEquivs=yes&maxJourneys=20&outputMode=tickerDataOnly&start=yes&selectDate=today"))),r=yield c(e.json()),o={type:1,value:t},i=new Map;for(let e of r.journey){if(!e.pr){console.log("no journey.pr in journey",e);continue}if(!e.st){console.log("no journey.st in journey",e);continue}if(e.rt&&"Ausfall"==e.rt.status){console.log("Ausfall not supported yet",e);continue}let t=null;if(t=e.rt?this.parseOebbDate(e.rt.dld,e.rt.dlt):this.parseOebbDate(e.da,e.ti),null!=t){let r=i.get(e.pr)||new Map,o=r.get(e.st)||[];o.push(t),r.set(e.st,o),i.set(e.pr,r)}else console.log("no departure time in journey",e)}for(let[e,t]of i)for(let[r,i]of t){let t={realtimeIdentifier:o,routeClassName:e,headsign:r,times:i};yield yield c(t)}}}))}async updateRealtimeForStops(e){var t,r,o,i;let n=await this.getRealtimeForWienerLinien(e.filter((e=>0==e.type)).map((e=>e.value)));for(let e of n)this.upsertRealtimeData(e,!0);try{for(var a,s=!0,l=function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,r=e[Symbol.asyncIterator];return r?r.call(e):(e="function"==typeof __values?__values(e):e[Symbol.iterator](),t={},o("next"),o("throw"),o("return"),t[Symbol.asyncIterator]=function(){return this},t);function o(r){t[r]=e[r]&&function(t){return new Promise((function(o,i){!function(e,t,r,o){Promise.resolve(o).then((function(t){e({value:t,done:r})}),t)}(o,i,(t=e[r](t)).done,t.value)}))}}}(this.getRealtimeForOebb(e.filter((e=>1==e.type)).map((e=>e.value))));!(t=(a=await l.next()).done);){i=a.value,s=!1;try{let e=i;this.upsertRealtimeData(e,!0)}finally{s=!0}}}catch(e){r={error:e}}finally{try{s||t||!(o=l.return)||await o.call(l)}finally{if(r)throw r.error}}}readLeg(e,t){var r;let o=new DataView(e,t,24),i=o.getUint16(4,!0),n=o.getUint16(6,!0),a=o.getUint32(8,!0),s=o.getUint32(12,!0),l={type:o.getUint32(0,!0),departureStop:this.routeInfoStore.getStop(i),arrivalStop:this.routeInfoStore.getStop(n),plannedDeparture:new Date(1e3*a),delay:o.getInt16(18,!0),arrivalTime:new Date(1e3*s),duration:1e3*(s-a),route:null,tripId:null,isRealtime:!1};if(1==l.type){let e=o.getUint16(16,!0);l.route=this.routeInfoStore.getRoute(e),l.tripId=o.getUint32(20,!0),l.isRealtime=(null===(r=this.mappedRealtimeData[l.route.id])||void 0===r?void 0:r.has(l.tripId))||!1}return l}readItinerary(e,t){let r=[],o=new DataView(e,t,244).getUint32(0,!0);for(let i=0;i<o;i++)r.push(this.readLeg(e,t+4+24*i));return{legs:r.reverse()}}readResults(e,t){let r=[],o=new DataView(e.buffer,t,1956).getUint32(0,!0);for(let i=0;i<o;i++){let o=this.readItinerary(e.buffer,t+4+244*i);r.push(o)}return r}readStoptimeUpdate(e,t){let r=new DataView(e,t,81),o=r.getUint16(0,!0),i=r.getUint16(2,!0),n=r.getInt16(4,!0);return{routeId:o,route:this.routeInfoStore.getRoute(o).name,trip:i,realtimeOffset:n}}getRealtimeUpdateResult(){let e=this.routingInstance.exports.get_stoptime_update_memory(),t=new DataView(this.routingInstance.exports.memory.buffer,e,81),r=t.getUint8(13),o=[];for(let i=0;i<r;i++){let r=this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer,e+16+20+8*i);o.push(Object.assign(Object.assign({},r),{numMatches:t.getUint8(76+i)}))}return o}upsertRealtimeData(e,t){performance.mark("realtime-upsert-start");let r=this.routeInfoStore.getRouteClassesFotRealtimeIdentifier(e.realtimeIdentifier),o=e.routeClassName.replace(/\s/g,"").toLowerCase(),i=r.map((e=>e.routeClassName.replace(/\s/g,"").toLowerCase())),n=r[i.findIndex((e=>e==o))];if(!n)return void console.log("no matching route class for ".concat(e.routeClassName));let a=e.headsign.replace(/^Wien /,"").trim().toLowerCase(),s=n.headsignVariants.map((e=>e.replace(/^Wien /,"").toLowerCase())),l=(0,p.findBestMatch)(a,s);this.upsertResolvedRealtimeData({headsignVariant:l.bestMatchIndex,realtimeIdentifier:e.realtimeIdentifier,routeClass:n.id,times:e.times},t),performance.mark("realtime-upsert-end"),performance.measure("realtime-upsert","realtime-upsert-start","realtime-upsert-end"),console.log("Realtime upsert took ".concat(performance.getEntriesByName("realtime-upsert","measure")[0].duration,"ms")),performance.clearMarks(),performance.clearMeasures()}upsertResolvedRealtimeData(e,t){let r=this.routingInstance.exports.get_stoptime_update_memory(),o=new DataView(this.routingInstance.exports.memory.buffer,r,81);o.setUint32(0,e.realtimeIdentifier.value,!0),o.setUint16(4,e.routeClass,!0),o.setUint8(6,e.headsignVariant);let i=this.timezoneUtility.getStartOfDay(e.times[0]);o.setUint8(7,i.dayOfWeek),o.setUint32(8,i.unixTime/1e3,!0),o.setUint8(12,t?1:0);let n=Math.min(e.times.length,5);o.setUint8(13,n),o.setUint16(14,e.realtimeIdentifier.type,!0);for(let t=0;t<n;t++)o.setUint32(16+4*t,(+e.times[t]-i.unixTime)/1e3,!0);this.routingInstance.exports.process_realtime();let a=this.getRealtimeUpdateResult();for(let e of a)e.numMatches>0&&(this.mappedRealtimeData[e.routeId]=this.mappedRealtimeData[e.routeId]||new Set,this.mappedRealtimeData[e.routeId].add(e.trip))}}class m{constructor(e,t){this.routeUrlEncoder=e,this.routeInfoStore=t}getRouteByUrl(e){return{legs:this.routeUrlEncoder.decode(e).legs.map((e=>({type:e.type,departureStop:this.routeInfoStore.getStop(e.departureStopId),arrivalStop:this.routeInfoStore.getStop(e.arrivalStopId),route:1==e.type?this.routeInfoStore.getRoute(e.routeId):null,tripId:e.tripId,plannedDeparture:new Date,arrivalTime:new Date,delay:0,duration:0,isRealtime:!1})))}}}class f{constructor(e,t){this.routeInfoStore=e,this.routingService=t,this.lookedUp=[]}hasJustBeenLookedUp(e){return this.lookedUp.some((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value&&(new Date).getTime()-t.when.getTime()<3e4))}setLookedUp(e){let t=this.lookedUp.find((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value));t?t.when=new Date:this.lookedUp.push({rtIdentifier:e,when:new Date})}async performWithRealtimeLoopkup(e){for(let t=0;t<10;t++){let t=await e(),r=[];for(let e of t.reduce(((e,t)=>[...e,this.routeInfoStore.getRealtimeIdentifier(t)]),[]))null===e||this.hasJustBeenLookedUp(e)||r.some((t=>t.type==e.type&&t.value==e.value))||r.push(e);if(0==r.length)break;await this.routingService.updateRealtimeForStops(r);for(let e of r)this.setLookedUp(e)}}}r(6699);class h{constructor(e){this.sstopGroupIndex=e}getStopGroup(e){if(e>this.sstopGroupIndex.length)throw new Error("Invalid stop group id ".concat(e));return this.sstopGroupIndex[e]}findByStopId(e){let t=this.sstopGroupIndex.find((t=>t.stopIds.includes(e)));return null==t?null:{id:t.stopIds.indexOf(e),name:t.name}}}let g,y=null;const S=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp",""),w=new a(S),v=new class{constructor(){this.dataVersion=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp","")}async populateTimeZones(){if(null==this.timezonesPromise){const{default:e}=await r.e(340).then(r.bind(r,6437));(0,l.wE)(e)}return this.timezonesPromise}async createRouteInfoStore(){let e=fetch(new URL(r(9826),r.b).toString()).then((e=>e.json())),t=fetch(new URL(r(3363),r.b).toString()).then((e=>e.json())),o=fetch(new URL(r(2800),r.b).toString()).then((e=>e.json())),i=fetch(new URL(r(6319),r.b).toString()).then((e=>e.json())),[n,a,l,u]=await Promise.all([e,t,o,i]);return new s(n,l,u,a)}async createRoutingInstance(){let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(1645),r.b).toString())),fetch(new URL(r(717),r.b).toString())]);return await o(e.instance,t,11,((e,t)=>e.exports.raptor_allocate(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]))),e.instance.exports.initialize(),e.instance}async getRoutingInstance(){return null==this.routingInstancePromise&&(this.routingInstancePromise=this.createRoutingInstance()),this.routingInstancePromise}async getRouteInfoStore(){return null==this.routeInfoStorePromise&&(this.routeInfoStorePromise=this.createRouteInfoStore()),this.routeInfoStorePromise}async createRoutingService(){let[e,t]=await Promise.all([this.getRoutingInstance(),this.getRouteInfoStore(),this.populateTimeZones()]);return new d(e,t)}async getRoutingService(){return null==this.routingServicePromise&&(this.routingServicePromise=this.createRoutingService()),this.routingServicePromise}async createRouteDetailsService(){let e=await this.getRouteInfoStore();return new m(new a(this.dataVersion),e)}async getRouteDetailsService(){return null==this.routeDetailsServicePromise&&(this.routeDetailsServicePromise=this.createRouteDetailsService()),this.routeDetailsServicePromise}async createRealtimeLookupService(){let[e,t]=await Promise.all([this.getRoutingService(),this.getRouteInfoStore()]);return new f(t,e)}async getRealtimeLookupService(){return null==this.realtimeLookupServicePromise&&(this.realtimeLookupServicePromise=this.createRealtimeLookupService()),this.realtimeLookupServicePromise}async createStopGroupStore(){let e=fetch(new URL(r(3369),r.b).toString()).then((e=>e.json()));return new h(await e)}async getStopGroupStore(){return null==this.stopGroupStorePromise&&(this.stopGroupStorePromise=this.createStopGroupStore()),this.stopGroupStorePromise}};let I="",b={arrivalStopResults:[],departureStopResults:[],results:[],routeDetail:null,departures:[],selectedStopgroups:{departure:null,arrival:null}};function R(e){let t=e(b);b=Object.assign(Object.assign({},b),t),self.postMessage([t,Object.keys(t)])}async function U(e,t){let r=await v.getStopGroupStore();if(null==g)return;let o,i=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(i==I)return;if(i.length==I.length+1&&i.startsWith(I))o=g.exports.stopsearch_step(i.charCodeAt(i.length-1));else{o=g.exports.stopsearch_reset();for(let e=0;e<i.length;e++)o=g.exports.stopsearch_step(i.charCodeAt(e))}I=i;let n=new DataView(g.exports.memory.buffer,o,8),a=n.getUint32(0,!0),s=n.getUint32(4,!0),l=new DataView(g.exports.memory.buffer,s,2*a),u=[];for(let e=0;e<a;e++){let t=l.getUint16(2*e,!0),o=r.getStopGroup(t);u.push({id:t,name:o.name})}R((e=>({[t?"departureStopResults":"arrivalStopResults"]:u})))}let D=Promise.resolve();async function x(){null!=b.selectedStopgroups.arrival&&null!=b.selectedStopgroups.departure?await async function(){let e=await v.getRoutingService(),t=await v.getRealtimeLookupService(),r=await v.getStopGroupStore(),o=r.getStopGroup(b.selectedStopgroups.departure.id).stopIds,i=r.getStopGroup(b.selectedStopgroups.arrival.id).stopIds[0];await t.performWithRealtimeLoopkup((async()=>{let t=e.route({arrivalStop:i,departureStops:o,departureTimes:o.map((()=>y))});return R((()=>({results:t.map((e=>({itineraryUrlEncoded:w.encode(e),itinerary:e})))}))),t.reduce(((e,t)=>[...e,...t.legs.map((e=>e.departureStop.stopId))]),[])}))}():null!=b.selectedStopgroups.departure&&(D=(async()=>{R((e=>({results:[]})));let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),o=e.getStopGroup(b.selectedStopgroups.departure.id).stopIds;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:o.map((e=>({departureTime:y,stopId:e})))});return R((()=>({departures:e}))),e.map((e=>e.stop.stopId))}))})(),await D)}self.postMessage([b,Object.keys(b)]),self.addEventListener("message",(e=>{(async function(e){switch(e.type){case 0:await async function(){if(g)return;let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(7981),r.b).toString())),fetch(new URL(r(4156),r.b).toString())]);await Promise.all([await v.getStopGroupStore(),o(e.instance,t,4,((e,t)=>e.exports.stopsearch_allocate(t[0]/12,t[1],t[3]/2)))]),e.instance.exports.stopsearch_reset(),g=e.instance}();break;case 1:U(e.term,!0);break;case 2:U(e.term,!1);break;case 3:await async function(){await v.getRoutingService()}();break;case 4:await async function(e,t){let r=await v.getStopGroupStore();R((o=>({selectedStopgroups:{departure:null==e?null:{id:e,name:r.getStopGroup(e).name},arrival:null==t?null:{id:t,name:r.getStopGroup(t).name}}}))),y=new Date,await x()}(e.departure,e.arrival);break;case 5:await async function(e){null!=y&&(y=new Date(y.getTime()+e),await x())}(e.increment);break;case 6:await async function(e){let t=await v.getRouteDetailsService(),r=await v.getStopGroupStore(),o=t.getRouteByUrl(e);R((()=>({routeDetail:{itineraryUrlEncoded:e,itinerary:o},selectedStopgroups:{departure:r.findByStopId(o.legs[0].departureStop.stopId),arrival:r.findByStopId(o.legs[o.legs.length-1].arrivalStop.stopId)}})))}(e.itineraryUrlEncoded);break;case 7:await async function(){var e;await D,null!=b.selectedStopgroups.departure&&(null===(e=b.departures)||void 0===e?void 0:e.length)>0&&(D=(async()=>{let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),o=e.getStopGroup(b.selectedStopgroups.departure.id).stopIds,i=b.departures;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:o.map((e=>({departureTime:new Date(i[i.length-1].plannedDeparture.getTime()+i[i.length-1].delay),stopId:e})))}),r=i.findIndex((t=>e.some((e=>t.route.id==e.route.id&&t.tripId==e.tripId&&t.stop.stopId==e.stop.stopId))));return-1!=r&&(r=i.length),R((()=>({departures:[...i.slice(0,r),...e]}))),e.map((e=>e.stop.stopId))}))})())}()}})(e.data).catch((e=>console.error(e)))}))},717:function(e,t,r){e.exports=r.p+"data/65dfe5d1ba0c428ed9dd.bmp"},6319:function(e,t,r){e.exports=r.p+"data/e85650514efb030c4a4a.json"},2800:function(e,t,r){e.exports=r.p+"data/0e7dd6550ecdd3133d67.json"},9826:function(e,t,r){e.exports=r.p+"data/cc28ca8691c49a192a21.json"},4156:function(e,t,r){e.exports=r.p+"data/d709f12cbbe1e5e85640.bmp"},3369:function(e,t,r){e.exports=r.p+"data/e6101f6a75f10f003887.json"},3363:function(e,t,r){e.exports=r.p+"data/8cc5d938e4b63f8e8d49.json"},1645:function(e,t,r){e.exports=r.p+"38864362453a95e1fd85.wasm"},7981:function(e,t,r){e.exports=r.p+"351daa55156e49690407.wasm"}},o={};function i(e){var t=o[e];if(void 0!==t)return t.exports;var n=o[e]={exports:{}};return r[e](n,n.exports,i),n.exports}i.m=r,i.x=function(){var e=i.O(void 0,[829,610],(function(){return i(5974)}));return i.O(e)},e=[],i.O=function(t,r,o,n){if(!r){var a=1/0;for(p=0;p<e.length;p++){r=e[p][0],o=e[p][1],n=e[p][2];for(var s=!0,l=0;l<r.length;l++)(!1&n||a>=n)&&Object.keys(i.O).every((function(e){return i.O[e](r[l])}))?r.splice(l--,1):(s=!1,n<a&&(a=n));if(s){e.splice(p--,1);var u=o();void 0!==u&&(t=u)}}return t}n=n||0;for(var p=e.length;p>0&&e[p-1][2]>n;p--)e[p]=e[p-1];e[p]=[r,o,n]},i.d=function(e,t){for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=function(e){return Promise.all(Object.keys(i.f).reduce((function(t,r){return i.f[r](e,t),t}),[]))},i.u=function(e){return{340:"c35744012a716af7ac2b",610:"793ff7186c0e18962283",829:"3b66761374760b6d4099"}[e]+".bundle.js"},i.miniCssF=function(e){},i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.p="/",function(){i.b=self.location+"";var e={974:1};i.f.i=function(t,r){e[t]||importScripts(i.p+i.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],r=t.push.bind(t);t.push=function(t){var o=t[0],n=t[1],a=t[2];for(var s in n)i.o(n,s)&&(i.m[s]=n[s]);for(a&&a(i);o.length;)e[o.pop()]=1;r(t)}}(),t=i.x,i.x=function(){return Promise.all([i.e(829),i.e(610)]).then(t)},i.x()}();
//# sourceMappingURL=147a8514cb65345359a0.bundle.js.map