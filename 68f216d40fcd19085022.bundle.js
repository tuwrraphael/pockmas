!function(){"use strict";var e,t,r,o,n={5974:function(e,t,r){async function o(e,t,r,o){let n,i=t.body.getReader(),a=!1,s=[],u=new Uint8Array(4*r),l=0;for(;!a;){let t=await i.read();if(a=t.done,t.done)break;let p=t.value;if(0==s.length){if(u.set(p.slice(0,Math.min(4*r-l,p.byteLength)),l),l+=p.byteLength,l<4*r)continue;{let e=new DataView(u.buffer);for(let t=0;t<r;t++)s.push(e.getUint32(4*t,!0));p=p.slice(4*r-l)}}s.length>0&&null==n&&(n=o(e,s)),null!=n&&(new Uint8Array(e.exports.memory.buffer,n,p.length).set(p),n+=p.length)}}r(5306),r(3948),r(285),r(1637),r(2472),r(8012),r(3105),r(3462),r(3824);var n=r(1673);class i extends Error{constructor(e,t){super("Data version mismatch - expected ".concat(e,", actual ").concat(t)),this.expected=e,this.actual=t}}class a{constructor(e){this.dataVersion=e,this.UrlVersion=1}encode(e){var t;let r=new Uint8Array(5+9*e.legs.filter((e=>1==e.type)).length+5*e.legs.filter((e=>0==e.type)).length),o=new DataView(r.buffer);o.setUint8(0,e.legs.length),o.setUint32(1,e.legs.length>0?e.legs[0].plannedDeparture.getTime()/1e3:0,!0);let i=5;for(let r of e.legs)o.setUint8(i+0,r.type),o.setUint16(i+1,r.departureStop.stopId,!0),o.setUint16(i+3,r.arrivalStop.stopId,!0),i+=5,1===r.type&&(o.setUint16(i,(null===(t=r.route)||void 0===t?void 0:t.id)||0,!0),o.setUint16(i+2,r.tripId||0,!0),i+=4);return"".concat(1).concat(n.DS.fromUint8Array(r,!0),"!").concat(this.dataVersion)}decode(e){let t=parseInt(e.substr(0,1));if(1===t)return this.decodeV1(e);throw new Error("Unsupported version ".concat(t))}decodeV1(e){let[t,r]=e.substr(1).split("!");if(r!==this.dataVersion)throw new i(this.dataVersion,r);let o=n.DS.toUint8Array(t),a=new DataView(o.buffer),s=a.getUint8(0),u=new Date(1e3*a.getUint32(1,!0)),l=[],p=5;for(let e=0;e<s;e++){let e=a.getUint8(p+0),t=a.getUint16(p+1,!0),r=a.getUint16(p+3,!0);if(p+=5,1===e){let o=a.getUint16(p,!0),n=a.getUint16(p+2,!0);p+=4,l.push({type:e,departureStopId:t,arrivalStopId:r,routeId:o,tripId:n})}else l.push({type:e,departureStopId:t,arrivalStopId:r,routeId:null,tripId:null})}return{departureTime:u,version:1,legs:l}}}class s{constructor(e,t,r,o){this.routes=e,this.routeClasses=t,this.routeClassesByRealtimeIdentifier=r,this.stops=o}getRealtimeIdentifier(e){return this.stops[e].length<1?null:{type:this.stops[e][1],value:this.stops[e][2]}}getStop(e){if(e>this.stops.length)throw new Error("Invalid stop id ".concat(e));return{stopId:e,stopName:this.stops[e][0]}}getRoute(e){if(e>this.routes.length)throw new Error("Invalid route id ".concat(e));let t=this.routes[e],r=this.routeClasses[t[0]],o="";return r.routeColor?o=r.routeColor:0==r.routeType&&(o="c4121a"),{name:this.routeClasses[t[0]].routeClassName,id:e,color:o,headsign:r.headsignVariants[t[1]]}}getRouteClassesFotRealtimeIdentifier(e){let t=e.type,r=e.value;return this.routeClassesByRealtimeIdentifier.find((e=>e[0]==t&&e[1]==r)).slice(2).map((e=>({routeClassName:this.routeClasses[e].routeClassName,headsignVariants:this.routeClasses[e].headsignVariants,id:e})))}}var u=r(9684);class l{constructor(e){this.tz=e}getTimezone(){return this.timezone||(this.timezone=(0,u.yQ)(this.tz)),this.timezone}dayOfWeekToMask(e){let t=0;return t=0==e?64:1<<e-1,t}getStartOfDay(e){const t=(0,u.iN)(e,this.getTimezone());return{unixTime:(0,u.ZG)({year:t.year,month:t.month,day:t.day,hours:0,minutes:0,seconds:0},this.getTimezone()),dayOfWeek:this.dayOfWeekToMask(t.dayOfWeek)}}getDateInTimezone(e,t,r,o,n,i){return new Date((0,u.ZG)({year:e,month:t,day:r,hours:o,minutes:n,seconds:i},this.getTimezone()))}}var p=r(4538),c=function(e){return this instanceof c?(this.v=e,this):new c(e)};class d{constructor(e,t){this.routingInstance=e,this.routeInfoStore=t,this.mappedRealtimeData={},this.timezoneUtility=new l("Europe/Vienna")}getDepartures(e){var t;this.setRequest(e);let r=this.routingInstance.exports.get_departures(),o=new DataView(this.routingInstance.exports.memory.buffer,r,164),n=o.getUint32(0,!0),i=[];for(let e=0;e<n;e++){let r=this.routeInfoStore.getRoute(o.getUint16(4+16*e,!0)),n=o.getUint32(8+16*e,!0),a={route:r,stop:this.routeInfoStore.getStop(o.getUint16(6+16*e,!0)),tripId:n,plannedDeparture:new Date(1e3*o.getUint32(12+16*e,!0)),delay:o.getInt16(16+16*e,!0),isRealtime:(null===(t=this.mappedRealtimeData[r.id])||void 0===t?void 0:t.has(n))||!1};i.push(a)}return i}setRequest(e){let t=this.routingInstance.exports.get_request_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,168);r.setUint8(0,0),r.setUint8(1,Math.min(20,e.departureStops.length)),r.setUint8(2,1);let o=this.timezoneUtility.getStartOfDay(e.departureStops[0].departureTime);r.setUint8(3,o.dayOfWeek);for(let t=0;t<Math.min(20,e.departureStops.length);t++)r.setUint16(4+2*t,e.departureStops[t].stopId,!0);"number"==typeof e.arrivalStop&&r.setUint16(44,e.arrivalStop,!0);let n=o.unixTime/1e3;for(let t=0;t<Math.min(20,e.departureStops.length);t++){let n=(+e.departureStops[t].departureTime-o.unixTime)/1e3;r.setUint32(84+4*t,n,!0)}r.setUint32(164,n,!0)}route(e){if(e.departureStops.length!=e.departureTimes.length)throw new Error("departureStops and departureTimes must have the same length");performance.mark("routing-start"),this.setRequest({departureStops:e.departureStops.map(((t,r)=>({stopId:t,departureTime:e.departureTimes[r]}))),arrivalStop:e.arrivalStop});let t=this.routingInstance.exports.raptor();return performance.mark("routing-done"),performance.measure("routing","routing-start","routing-done"),console.log("routing took ".concat(performance.getEntriesByName("routing")[0].duration,"ms")),performance.clearMarks(),performance.clearMeasures(),this.readResults(this.routingInstance.exports.memory,t)}async getRealtimeForWienerLinien(e){var t,r,o,n,i,a;let s=new URLSearchParams;for(let t of e)s.append("diva",t.toString());let u=await fetch("https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?".concat(s)),l=await u.json(),p=[];for(let e of l.data.monitors){let s={type:0,value:parseInt(e.locationStop.properties.name)};for(let u of e.lines){let e=new Map;for(let s of u.departures.departure)if((null===(t=s.departureTime)||void 0===t?void 0:t.timeReal)||(null===(r=s.departureTime)||void 0===r?void 0:r.timePlanned)){let t=e.get((null===(o=s.vehicle)||void 0===o?void 0:o.name)||u.name)||new Map,r=s.departureTime.timeReal?new Date(s.departureTime.timeReal):new Date(s.departureTime.timePlanned),l=t.get((null===(n=s.vehicle)||void 0===n?void 0:n.towards)||u.towards)||[];l.push(r),t.set((null===(i=s.vehicle)||void 0===i?void 0:i.towards)||u.towards,l),e.set((null===(a=s.vehicle)||void 0===a?void 0:a.name)||u.name,t)}else console.log("no departure time in departure",s);for(let[t,r]of e)for(let[e,o]of r){let r={realtimeIdentifier:s,routeClassName:t,headsign:e,times:o};p.push(r)}}}return p}parseOebbDate(e,t){if(!(e&&t&&/^(\d{2})\.(\d{2})\.(\d{4})$/.test(e)&&/^(\d{2}):(\d{2})$/.test(t)))return console.log('unexpected oebb date or time: "'.concat(e,'" "').concat(t,'"')),null;let r=e.split("."),o=t.split(":");return this.timezoneUtility.getDateInTimezone(+r[2],+r[1],+r[0],+o[0],+o[1],0)}getRealtimeForOebb(e){return function(e,t,r){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var o,n=r.apply(e,t||[]),i=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(e){n[e]&&(o[e]=function(t){return new Promise((function(r,o){i.push([e,t,r,o])>1||s(e,t)}))})}function s(e,t){try{(r=n[e](t)).value instanceof c?Promise.resolve(r.value.v).then(u,l):p(i[0][2],r)}catch(e){p(i[0][3],e)}var r}function u(e){s("next",e)}function l(e){s("throw",e)}function p(e,t){e(t),i.shift(),i.length&&s(i[0][0],i[0][1])}}(this,arguments,(function*(){for(let t of e){let e=yield c(fetch("https://realtime-api.grapp.workers.dev/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=".concat(t,"&boardType=dep&productsFilter=1011111111011&additionalTime=0&disableEquivs=yes&maxJourneys=20&outputMode=tickerDataOnly&start=yes&selectDate=today"))),r=yield c(e.json()),o={type:1,value:t},n=new Map;for(let e of r.journey){if(!e.pr){console.log("no journey.pr in journey",e);continue}if(!e.st){console.log("no journey.st in journey",e);continue}if(e.rt&&"Ausfall"==e.rt.status){console.log("Ausfall not supported yet",e);continue}let t=null;if(t=e.rt?this.parseOebbDate(e.rt.dld,e.rt.dlt):this.parseOebbDate(e.da,e.ti),null!=t){let r=n.get(e.pr)||new Map,o=r.get(e.st)||[];o.push(t),r.set(e.st,o),n.set(e.pr,r)}else console.log("no departure time in journey",e)}for(let[e,t]of n)for(let[r,n]of t){let t={realtimeIdentifier:o,routeClassName:e,headsign:r,times:n};yield yield c(t)}}}))}async updateRealtimeForStops(e){var t,r;let o=await this.getRealtimeForWienerLinien(e.filter((e=>0==e.type)).map((e=>e.value)));for(let e of o)this.upsertRealtimeData(e,!0);try{for(var n,i=function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,r=e[Symbol.asyncIterator];return r?r.call(e):(e="function"==typeof __values?__values(e):e[Symbol.iterator](),t={},o("next"),o("throw"),o("return"),t[Symbol.asyncIterator]=function(){return this},t);function o(r){t[r]=e[r]&&function(t){return new Promise((function(o,n){!function(e,t,r,o){Promise.resolve(o).then((function(t){e({value:t,done:r})}),t)}(o,n,(t=e[r](t)).done,t.value)}))}}}(this.getRealtimeForOebb(e.filter((e=>1==e.type)).map((e=>e.value))));!(n=await i.next()).done;){let e=n.value;this.upsertRealtimeData(e,!0)}}catch(e){t={error:e}}finally{try{n&&!n.done&&(r=i.return)&&await r.call(i)}finally{if(t)throw t.error}}}readLeg(e,t){var r;let o=new DataView(e,t,24),n=o.getUint16(4,!0),i=o.getUint16(6,!0),a=o.getUint32(8,!0),s=o.getUint32(12,!0),u={type:o.getUint32(0,!0),departureStop:this.routeInfoStore.getStop(n),arrivalStop:this.routeInfoStore.getStop(i),plannedDeparture:new Date(1e3*a),delay:o.getInt16(18,!0),arrivalTime:new Date(1e3*s),duration:1e3*(s-a),route:null,tripId:null,isRealtime:!1};if(1==u.type){let e=o.getUint16(16,!0);u.route=this.routeInfoStore.getRoute(e),u.tripId=o.getUint32(20,!0),u.isRealtime=(null===(r=this.mappedRealtimeData[u.route.id])||void 0===r?void 0:r.has(u.tripId))||!1}return u}readItinerary(e,t){let r=[],o=new DataView(e,t,244).getUint32(0,!0);for(let n=0;n<o;n++)r.push(this.readLeg(e,t+4+24*n));return{legs:r.reverse()}}readResults(e,t){let r=[],o=new DataView(e.buffer,t,1956).getUint32(0,!0);for(let n=0;n<o;n++){let o=this.readItinerary(e.buffer,t+4+244*n);r.push(o)}return r}readStoptimeUpdate(e,t){let r=new DataView(e,t,81),o=r.getUint16(0,!0),n=r.getUint16(2,!0),i=r.getInt16(4,!0);return{routeId:o,route:this.routeInfoStore.getRoute(o).name,trip:n,realtimeOffset:i}}getRealtimeUpdateResult(){let e=this.routingInstance.exports.get_stoptime_update_memory(),t=new DataView(this.routingInstance.exports.memory.buffer,e,81),r=t.getUint8(13),o=[];for(let n=0;n<r;n++){let r=this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer,e+16+20+8*n);o.push(Object.assign(Object.assign({},r),{numMatches:t.getUint8(76+n)}))}return o}upsertRealtimeData(e,t){performance.mark("realtime-upsert-start");let r=this.routeInfoStore.getRouteClassesFotRealtimeIdentifier(e.realtimeIdentifier),o=e.routeClassName.replace(/\s/g,"").toLowerCase(),n=r.map((e=>e.routeClassName.replace(/\s/g,"").toLowerCase())),i=r[n.findIndex((e=>e==o))];if(!i)return void console.log("no matching route class for ".concat(e.routeClassName));let a=e.headsign.replace(/^Wien /,"").trim().toLowerCase(),s=i.headsignVariants.map((e=>e.replace(/^Wien /,"").toLowerCase())),u=(0,p.findBestMatch)(a,s);this.upsertResolvedRealtimeData({headsignVariant:u.bestMatchIndex,realtimeIdentifier:e.realtimeIdentifier,routeClass:i.id,times:e.times},t),performance.mark("realtime-upsert-end"),performance.measure("realtime-upsert","realtime-upsert-start","realtime-upsert-end"),console.log("Realtime upsert took ".concat(performance.getEntriesByName("realtime-upsert","measure")[0].duration,"ms")),performance.clearMarks(),performance.clearMeasures()}upsertResolvedRealtimeData(e,t){let r=this.routingInstance.exports.get_stoptime_update_memory(),o=new DataView(this.routingInstance.exports.memory.buffer,r,81);o.setUint32(0,e.realtimeIdentifier.value,!0),o.setUint16(4,e.routeClass,!0),o.setUint8(6,e.headsignVariant);let n=this.timezoneUtility.getStartOfDay(e.times[0]);o.setUint8(7,n.dayOfWeek),o.setUint32(8,n.unixTime/1e3,!0),o.setUint8(12,t?1:0);let i=Math.min(e.times.length,5);o.setUint8(13,i),o.setUint16(14,e.realtimeIdentifier.type,!0);for(let t=0;t<i;t++)o.setUint32(16+4*t,(+e.times[t]-n.unixTime)/1e3,!0);this.routingInstance.exports.process_realtime();let a=this.getRealtimeUpdateResult();for(let e of a)e.numMatches>0&&(this.mappedRealtimeData[e.routeId]=this.mappedRealtimeData[e.routeId]||new Set,this.mappedRealtimeData[e.routeId].add(e.trip))}}class f{constructor(e,t){this.routeUrlEncoder=e,this.routeInfoStore=t}getRouteByUrl(e){return{legs:this.routeUrlEncoder.decode(e).legs.map((e=>({type:e.type,departureStop:this.routeInfoStore.getStop(e.departureStopId),arrivalStop:this.routeInfoStore.getStop(e.arrivalStopId),route:1==e.type?this.routeInfoStore.getRoute(e.routeId):null,tripId:e.tripId,plannedDeparture:new Date,arrivalTime:new Date,delay:0,duration:0,isRealtime:!1})))}}}class m{constructor(e,t){this.routeInfoStore=e,this.routingService=t,this.lookedUp=[]}hasJustBeenLookedUp(e){return this.lookedUp.some((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value&&(new Date).getTime()-t.when.getTime()<3e4))}setLookedUp(e){let t=this.lookedUp.find((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value));t?t.when=new Date:this.lookedUp.push({rtIdentifier:e,when:new Date})}async performWithRealtimeLoopkup(e){for(let t=0;t<10;t++){let t=await e(),r=[];for(let e of t.reduce(((e,t)=>[...e,this.routeInfoStore.getRealtimeIdentifier(t)]),[]))null===e||this.hasJustBeenLookedUp(e)||r.some((t=>t.type==e.type&&t.value==e.value))||r.push(e);if(0==r.length)break;await this.routingService.updateRealtimeForStops(r);for(let e of r)this.setLookedUp(e)}}}r(6699);class h{constructor(e){this.sstopGroupIndex=e}getStopGroup(e){if(e>this.sstopGroupIndex.length)throw new Error("Invalid stop group id ".concat(e));return this.sstopGroupIndex[e]}findByStopId(e){let t=this.sstopGroupIndex.find((t=>t.stopIds.includes(e)));return null==t?null:{id:t.stopIds.indexOf(e),name:t.name}}}let g,y=null;const S=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp",""),w=new a(S),v=new class{constructor(){this.dataVersion=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp","")}populateTimeZones(){return null==this.timezonesPromise&&(this.timezonesPromise=r.e(955).then(r.t.bind(r,6955,23)).then((e=>(0,u.wE)(e)))),this.timezonesPromise}async createRouteInfoStore(){let e=fetch(new URL(r(9826),r.b).toString()).then((e=>e.json())),t=fetch(new URL(r(3363),r.b).toString()).then((e=>e.json())),o=fetch(new URL(r(2800),r.b).toString()).then((e=>e.json())),n=fetch(new URL(r(6319),r.b).toString()).then((e=>e.json())),[i,a,u,l]=await Promise.all([e,t,o,n]);return new s(i,u,l,a)}async createRoutingInstance(){let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(1645),r.b).toString())),fetch(new URL(r(717),r.b).toString())]);return await o(e.instance,t,11,((e,t)=>e.exports.raptor_allocate(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]))),e.instance.exports.initialize(),e.instance}async getRoutingInstance(){return null==this.routingInstancePromise&&(this.routingInstancePromise=this.createRoutingInstance()),this.routingInstancePromise}async getRouteInfoStore(){return null==this.routeInfoStorePromise&&(this.routeInfoStorePromise=this.createRouteInfoStore()),this.routeInfoStorePromise}async createRoutingService(){let[e,t]=await Promise.all([this.getRoutingInstance(),this.getRouteInfoStore(),this.populateTimeZones()]);return new d(e,t)}async getRoutingService(){return null==this.routingServicePromise&&(this.routingServicePromise=this.createRoutingService()),this.routingServicePromise}async createRouteDetailsService(){let e=await this.getRouteInfoStore();return new f(new a(this.dataVersion),e)}async getRouteDetailsService(){return null==this.routeDetailsServicePromise&&(this.routeDetailsServicePromise=this.createRouteDetailsService()),this.routeDetailsServicePromise}async createRealtimeLookupService(){let[e,t]=await Promise.all([this.getRoutingService(),this.getRouteInfoStore()]);return new m(t,e)}async getRealtimeLookupService(){return null==this.realtimeLookupServicePromise&&(this.realtimeLookupServicePromise=this.createRealtimeLookupService()),this.realtimeLookupServicePromise}async createStopGroupStore(){let e=fetch(new URL(r(3369),r.b).toString()).then((e=>e.json()));return new h(await e)}async getStopGroupStore(){return null==this.stopGroupStorePromise&&(this.stopGroupStorePromise=this.createStopGroupStore()),this.stopGroupStorePromise}};let I="",b={arrivalStopResults:[],departureStopResults:[],results:[],routeDetail:null,departures:[],selectedStopgroups:{departure:null,arrival:null}};function R(e){let t=e(b);b=Object.assign(Object.assign({},b),t),self.postMessage([t,Object.keys(t)])}async function U(e,t){let r=await v.getStopGroupStore();if(null==g)return;let o,n=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(n==I)return;if(n.length==I.length+1&&n.startsWith(I))o=g.exports.stopsearch_step(n.charCodeAt(n.length-1));else{o=g.exports.stopsearch_reset();for(let e=0;e<n.length;e++)o=g.exports.stopsearch_step(n.charCodeAt(e))}I=n;let i=new DataView(g.exports.memory.buffer,o,8),a=i.getUint32(0,!0),s=i.getUint32(4,!0),u=new DataView(g.exports.memory.buffer,s,2*a),l=[];for(let e=0;e<a;e++){let t=u.getUint16(2*e,!0),o=r.getStopGroup(t);l.push({id:t,name:o.name})}R((e=>({[t?"departureStopResults":"arrivalStopResults"]:l})))}let D=Promise.resolve();async function x(){null!=b.selectedStopgroups.arrival&&null!=b.selectedStopgroups.departure?await async function(){let e=await v.getRoutingService(),t=await v.getRealtimeLookupService(),r=await v.getStopGroupStore(),o=r.getStopGroup(b.selectedStopgroups.departure.id).stopIds,n=r.getStopGroup(b.selectedStopgroups.arrival.id).stopIds[0];await t.performWithRealtimeLoopkup((async()=>{let t=e.route({arrivalStop:n,departureStops:o,departureTimes:o.map((()=>y))});return R((()=>({results:t.map((e=>({itineraryUrlEncoded:w.encode(e),itinerary:e})))}))),t.reduce(((e,t)=>[...e,...t.legs.map((e=>e.departureStop.stopId))]),[])}))}():null!=b.selectedStopgroups.departure&&(D=(async()=>{R((e=>({results:[]})));let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),o=e.getStopGroup(b.selectedStopgroups.departure.id).stopIds;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:o.map((e=>({departureTime:y,stopId:e})))});return R((()=>({departures:e}))),e.map((e=>e.stop.stopId))}))})(),await D)}self.postMessage([b,Object.keys(b)]),self.addEventListener("message",(e=>{(async function(e){switch(e.type){case 0:await async function(){if(g)return;let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(7981),r.b).toString())),fetch(new URL(r(4156),r.b).toString())]);await Promise.all([await v.getStopGroupStore(),o(e.instance,t,4,((e,t)=>e.exports.stopsearch_allocate(t[0]/12,t[1],t[3]/2)))]),e.instance.exports.stopsearch_reset(),g=e.instance}();break;case 1:U(e.term,!0);break;case 2:U(e.term,!1);break;case 3:await async function(){await v.getRoutingService()}();break;case 4:await async function(e,t){let r=await v.getStopGroupStore();R((o=>({selectedStopgroups:{departure:null==e?null:{id:e,name:r.getStopGroup(e).name},arrival:null==t?null:{id:t,name:r.getStopGroup(t).name}}}))),y=new Date,await x()}(e.departure,e.arrival);break;case 5:await async function(e){null!=y&&(y=new Date(y.getTime()+e),await x())}(e.increment);break;case 6:await async function(e){let t=await v.getRouteDetailsService(),r=await v.getStopGroupStore(),o=t.getRouteByUrl(e);R((()=>({routeDetail:{itineraryUrlEncoded:e,itinerary:o},selectedStopgroups:{departure:r.findByStopId(o.legs[0].departureStop.stopId),arrival:r.findByStopId(o.legs[o.legs.length-1].arrivalStop.stopId)}})))}(e.itineraryUrlEncoded);break;case 7:await async function(){var e;await D,null!=b.selectedStopgroups.departure&&(null===(e=b.departures)||void 0===e?void 0:e.length)>0&&(D=(async()=>{let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),o=e.getStopGroup(b.selectedStopgroups.departure.id).stopIds,n=b.departures;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:o.map((e=>({departureTime:new Date(n[n.length-1].plannedDeparture.getTime()+n[n.length-1].delay),stopId:e})))}),r=n.findIndex((t=>e.some((e=>t.route.id==e.route.id&&t.tripId==e.tripId&&t.stop.stopId==e.stop.stopId))));return-1!=r&&(r=n.length),R((()=>({departures:[...n.slice(0,r),...e]}))),e.map((e=>e.stop.stopId))}))})())}()}})(e.data).catch((e=>console.error(e)))}))},717:function(e,t,r){e.exports=r.p+"data/23a8a3a4d1f6faa376ed.bmp"},6319:function(e,t,r){e.exports=r.p+"data/539358d746496c50c9a9.json"},2800:function(e,t,r){e.exports=r.p+"data/f8ac078a4e8ac76fd7bf.json"},9826:function(e,t,r){e.exports=r.p+"data/4d807814c84c0e89708d.json"},4156:function(e,t,r){e.exports=r.p+"data/0f86ee7856c3b64b1a9f.bmp"},3369:function(e,t,r){e.exports=r.p+"data/ae43d1f528f60d924e6a.json"},3363:function(e,t,r){e.exports=r.p+"data/afe0d66f6d177f8a6115.json"},1645:function(e,t,r){e.exports=r.p+"38864362453a95e1fd85.wasm"},7981:function(e,t,r){e.exports=r.p+"351daa55156e49690407.wasm"}},i={};function a(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return n[e](r,r.exports,a),r.exports}a.m=n,a.x=function(){var e=a.O(void 0,[829,473],(function(){return a(5974)}));return a.O(e)},e=[],a.O=function(t,r,o,n){if(!r){var i=1/0;for(p=0;p<e.length;p++){r=e[p][0],o=e[p][1],n=e[p][2];for(var s=!0,u=0;u<r.length;u++)(!1&n||i>=n)&&Object.keys(a.O).every((function(e){return a.O[e](r[u])}))?r.splice(u--,1):(s=!1,n<i&&(i=n));if(s){e.splice(p--,1);var l=o();void 0!==l&&(t=l)}}return t}n=n||0;for(var p=e.length;p>0&&e[p-1][2]>n;p--)e[p]=e[p-1];e[p]=[r,o,n]},r=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},a.t=function(e,o){if(1&o&&(e=this(e)),8&o)return e;if("object"==typeof e&&e){if(4&o&&e.__esModule)return e;if(16&o&&"function"==typeof e.then)return e}var n=Object.create(null);a.r(n);var i={};t=t||[null,r({}),r([]),r(r)];for(var s=2&o&&e;"object"==typeof s&&!~t.indexOf(s);s=r(s))Object.getOwnPropertyNames(s).forEach((function(t){i[t]=function(){return e[t]}}));return i.default=function(){return e},a.d(n,i),n},a.d=function(e,t){for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.f={},a.e=function(e){return Promise.all(Object.keys(a.f).reduce((function(t,r){return a.f[r](e,t),t}),[]))},a.u=function(e){return{473:"555b48af762420a1e009",829:"3b66761374760b6d4099",955:"aca8258eee8d7b804046"}[e]+".bundle.js"},a.miniCssF=function(e){},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.p="/",function(){a.b=self.location+"";var e={974:1};a.f.i=function(t,r){e[t]||importScripts(a.p+a.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],r=t.push.bind(t);t.push=function(t){var o=t[0],n=t[1],i=t[2];for(var s in n)a.o(n,s)&&(a.m[s]=n[s]);for(i&&i(a);o.length;)e[o.pop()]=1;r(t)}}(),o=a.x,a.x=function(){return Promise.all([a.e(829),a.e(473)]).then(o)},a.x()}();
//# sourceMappingURL=68f216d40fcd19085022.bundle.js.map