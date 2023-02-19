!function(){"use strict";var e,t,r={3468:function(e,t,r){async function i(e,t,r,i){let o,n=t.body.getReader(),a=!1,s=[],l=new Uint8Array(4*r),u=0;for(;!a;){let t=await n.read();if(a=t.done,t.done)break;let p=t.value;if(0==s.length){if(l.set(p.slice(0,Math.min(4*r-u,p.byteLength)),u),u+=p.byteLength,u<4*r)continue;{let e=new DataView(l.buffer);for(let t=0;t<r;t++)s.push(e.getUint32(4*t,!0));p=p.slice(4*r-u)}}s.length>0&&null==o&&(o=i(e,s)),null!=o&&(new Uint8Array(e.exports.memory.buffer,o,p.length).set(p),o+=p.length)}}r(8012);class o{constructor(e,t,r,i){this.routes=e,this.routeClasses=t,this.routeClassesByRealtimeIdentifier=r,this.stops=i}getRealtimeIdentifier(e){return this.stops[e].length<1?null:{type:this.stops[e][1],value:this.stops[e][2]}}getStop(e){if(e>this.stops.length)throw new Error(`Invalid stop id ${e}`);return{stopId:e,stopName:this.stops[e][0]}}getRoute(e){if(e>this.routes.length)throw new Error(`Invalid route id ${e}`);let t=this.routes[e],r=this.routeClasses[t[0]],i="";return r.routeColor?i=r.routeColor:0==r.routeType&&(i="c4121a"),{name:this.routeClasses[t[0]].routeClassName,id:e,color:i,headsign:r.headsignVariants[t[1]]}}getRouteClassesFotRealtimeIdentifier(e){let t=e.type,r=e.value;return this.routeClassesByRealtimeIdentifier.find((e=>e[0]==t&&e[1]==r)).slice(2).map((e=>({routeClassName:this.routeClasses[e].routeClassName,headsignVariants:this.routeClasses[e].headsignVariants,id:e})))}}var n=r(4538),a=function(e){return this instanceof a?(this.v=e,this):new a(e)};class s{constructor(e,t,r){this.routingInstance=e,this.routeInfoStore=t,this.timezoneUtility=r,this.mappedRealtimeData={}}hasRealtime(e,t){var r;return(null===(r=this.mappedRealtimeData[e])||void 0===r?void 0:r.has(t))||!1}mapToDeparture(e,t){let r=this.routeInfoStore.getRoute(e.getUint16(t,!0)),i=e.getUint32(t+4,!0);return{route:r,stop:this.routeInfoStore.getStop(e.getUint16(t+2,!0)),tripId:i,plannedDeparture:new Date(1e3*e.getUint32(t+8,!0)),delay:e.getInt16(t+12,!0),isRealtime:this.hasRealtime(r.id,i)}}getDepartures(e){this.setRequest(e);let t=this.routingInstance.exports.get_departures(),r=new DataView(this.routingInstance.exports.memory.buffer,t,164),i=r.getUint32(0,!0),o=[];for(let e=0;e<i;e++){let t=this.mapToDeparture(r,4+16*e);o.push(t)}return o}setRequest(e){let t=this.routingInstance.exports.get_request_memory(),r=new DataView(this.routingInstance.exports.memory.buffer,t,168);r.setUint8(0,0),r.setUint8(1,Math.min(20,e.departureStops.length)),r.setUint8(2,1);let i=this.timezoneUtility.getStartOfDay(e.departureStops[0].departureTime);r.setUint8(3,i.dayOfWeek);for(let t=0;t<Math.min(20,e.departureStops.length);t++)r.setUint16(4+2*t,e.departureStops[t].stopId,!0);"number"==typeof e.arrivalStop&&r.setUint16(44,e.arrivalStop,!0);let o=i.unixTime/1e3;for(let t=0;t<Math.min(20,e.departureStops.length);t++){let o=(+e.departureStops[t].departureTime-i.unixTime)/1e3;r.setUint32(84+4*t,o,!0)}r.setUint32(164,o,!0)}route(e){if(e.departureStops.length!=e.departureTimes.length)throw new Error("departureStops and departureTimes must have the same length");performance.mark("routing-start"),this.setRequest({departureStops:e.departureStops.map(((t,r)=>({stopId:t,departureTime:e.departureTimes[r]}))),arrivalStop:e.arrivalStop});let t=this.routingInstance.exports.raptor();return performance.mark("routing-done"),performance.measure("routing","routing-start","routing-done"),console.log(`routing took ${performance.getEntriesByName("routing")[0].duration}ms`),performance.clearMarks(),performance.clearMeasures(),this.readResults(this.routingInstance.exports.memory,t)}async getRealtimeForWienerLinien(e){var t,r,i,o,n,a;let s=new URLSearchParams;for(let t of e)s.append("diva",t.toString());let l=await fetch(`https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?${s}`),u=await l.json(),p=[];for(let e of u.data.monitors){let s={type:0,value:parseInt(e.locationStop.properties.name)};for(let l of e.lines){let e=new Map;for(let s of l.departures.departure)if((null===(t=s.departureTime)||void 0===t?void 0:t.timeReal)||(null===(r=s.departureTime)||void 0===r?void 0:r.timePlanned)){let t=e.get((null===(i=s.vehicle)||void 0===i?void 0:i.name)||l.name)||new Map,r=s.departureTime.timeReal?new Date(s.departureTime.timeReal):new Date(s.departureTime.timePlanned),u=t.get((null===(o=s.vehicle)||void 0===o?void 0:o.towards)||l.towards)||[];u.push(r),t.set((null===(n=s.vehicle)||void 0===n?void 0:n.towards)||l.towards,u),e.set((null===(a=s.vehicle)||void 0===a?void 0:a.name)||l.name,t)}else console.log("no departure time in departure",s);for(let[t,r]of e)for(let[e,i]of r){let r={realtimeIdentifier:s,routeClassName:t,headsign:e,times:i};p.push(r)}}}return p}parseOebbDate(e,t){if(!(e&&t&&/^(\d{2})\.(\d{2})\.(\d{4})$/.test(e)&&/^(\d{2}):(\d{2})$/.test(t)))return console.log(`unexpected oebb date or time: "${e}" "${t}"`),null;let r=e.split("."),i=t.split(":");return this.timezoneUtility.getDateInTimezone(+r[2],+r[1],+r[0],+i[0],+i[1],0)}getRealtimeForOebb(e){return function(e,t,r){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i,o=r.apply(e,t||[]),n=[];return i={},s("next"),s("throw"),s("return"),i[Symbol.asyncIterator]=function(){return this},i;function s(e){o[e]&&(i[e]=function(t){return new Promise((function(r,i){n.push([e,t,r,i])>1||l(e,t)}))})}function l(e,t){try{(r=o[e](t)).value instanceof a?Promise.resolve(r.value.v).then(u,p):d(n[0][2],r)}catch(e){d(n[0][3],e)}var r}function u(e){l("next",e)}function p(e){l("throw",e)}function d(e,t){e(t),n.shift(),n.length&&l(n[0][0],n[0][1])}}(this,arguments,(function*(){for(let t of e){let e=yield a(fetch(`https://realtime-api.grapp.workers.dev/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=${t}&boardType=dep&productsFilter=1011111111011&additionalTime=0&disableEquivs=yes&maxJourneys=20&outputMode=tickerDataOnly&start=yes&selectDate=today`)),r=yield a(e.json()),i={type:1,value:t},o=new Map;for(let e of r.journey){if(!e.pr){console.log("no journey.pr in journey",e);continue}if(!e.st){console.log("no journey.st in journey",e);continue}if(e.rt&&"Ausfall"==e.rt.status){console.log("Ausfall not supported yet",e);continue}let t=null;if(t=e.rt?this.parseOebbDate(e.rt.dld,e.rt.dlt):this.parseOebbDate(e.da,e.ti),null!=t){let r=o.get(e.pr)||new Map,i=r.get(e.st)||[];i.push(t),r.set(e.st,i),o.set(e.pr,r)}else console.log("no departure time in journey",e)}for(let[e,t]of o)for(let[r,o]of t){let t={realtimeIdentifier:i,routeClassName:e,headsign:r,times:o};yield yield a(t)}}}))}async updateRealtimeForStops(e){var t,r,i,o;let n=await this.getRealtimeForWienerLinien(e.filter((e=>0==e.type)).map((e=>e.value)));for(let e of n)this.upsertRealtimeData(e,!0);try{for(var a,s=!0,l=function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,r=e[Symbol.asyncIterator];return r?r.call(e):(e="function"==typeof __values?__values(e):e[Symbol.iterator](),t={},i("next"),i("throw"),i("return"),t[Symbol.asyncIterator]=function(){return this},t);function i(r){t[r]=e[r]&&function(t){return new Promise((function(i,o){!function(e,t,r,i){Promise.resolve(i).then((function(t){e({value:t,done:r})}),t)}(i,o,(t=e[r](t)).done,t.value)}))}}}(this.getRealtimeForOebb(e.filter((e=>1==e.type)).map((e=>e.value))));!(t=(a=await l.next()).done);){o=a.value,s=!1;try{let e=o;this.upsertRealtimeData(e,!0)}finally{s=!0}}}catch(e){r={error:e}}finally{try{s||t||!(i=l.return)||await i.call(l)}finally{if(r)throw r.error}}}readLeg(e,t){let r=new DataView(e,t,24),i=r.getUint16(4,!0),o=r.getUint16(6,!0),n=r.getUint32(8,!0),a=r.getUint32(12,!0),s={type:r.getUint32(0,!0),departureStop:this.routeInfoStore.getStop(i),arrivalStop:this.routeInfoStore.getStop(o),plannedDeparture:new Date(1e3*n),delay:r.getInt16(18,!0),arrivalTime:new Date(1e3*a),duration:1e3*(a-n),route:null,tripId:null,isRealtime:!1};if(1==s.type){let e=r.getUint16(16,!0);s.route=this.routeInfoStore.getRoute(e),s.tripId=r.getUint32(20,!0),s.isRealtime=this.hasRealtime(s.route.id,s.tripId)}return s}readItinerary(e,t){let r=[],i=new DataView(e,t,244).getUint32(0,!0);for(let o=0;o<i;o++)r.push(this.readLeg(e,t+4+24*o));return{legs:r.reverse()}}readResults(e,t){let r=[],i=new DataView(e.buffer,t,1956).getUint32(0,!0);for(let o=0;o<i;o++){let i=this.readItinerary(e.buffer,t+4+244*o);r.push(i)}return r}readStoptimeUpdate(e,t){let r=new DataView(e,t,81),i=r.getUint16(0,!0),o=r.getUint16(2,!0),n=r.getInt16(4,!0);return{routeId:i,route:this.routeInfoStore.getRoute(i).name,trip:o,realtimeOffset:n}}getRealtimeUpdateResult(){let e=this.routingInstance.exports.get_stoptime_update_memory(),t=new DataView(this.routingInstance.exports.memory.buffer,e,81),r=t.getUint8(13),i=[];for(let o=0;o<r;o++){let r=this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer,e+16+20+8*o);i.push(Object.assign(Object.assign({},r),{numMatches:t.getUint8(76+o)}))}return i}upsertRealtimeData(e,t){let r=this.routeInfoStore.getRouteClassesFotRealtimeIdentifier(e.realtimeIdentifier),i=e.routeClassName.replace(/\s/g,"").toLowerCase(),o=r.map((e=>e.routeClassName.replace(/\s/g,"").toLowerCase())),a=r[o.findIndex((e=>e==i))];if(!a)return void console.log(`no matching route class for ${e.routeClassName}`);let s=e.headsign.replace(/^Wien /,"").trim().toLowerCase(),l=a.headsignVariants.map((e=>e.replace(/^Wien /,"").toLowerCase())),u=(0,n.findBestMatch)(s,l);this.upsertResolvedRealtimeData({headsignVariant:u.bestMatchIndex,realtimeIdentifier:e.realtimeIdentifier,routeClass:a.id,times:e.times},t)}upsertResolvedRealtimeData(e,t){let r=this.routingInstance.exports.get_stoptime_update_memory(),i=new DataView(this.routingInstance.exports.memory.buffer,r,81);i.setUint32(0,e.realtimeIdentifier.value,!0),i.setUint16(4,e.routeClass,!0),i.setUint8(6,e.headsignVariant);let o=this.timezoneUtility.getStartOfDay(e.times[0]);i.setUint8(7,o.dayOfWeek),i.setUint32(8,o.unixTime/1e3,!0),i.setUint8(12,t?1:0);let n=Math.min(e.times.length,5);i.setUint8(13,n),i.setUint16(14,e.realtimeIdentifier.type,!0);for(let t=0;t<n;t++)i.setUint32(16+4*t,(+e.times[t]-o.unixTime)/1e3,!0);this.routingInstance.exports.process_realtime();let a=this.getRealtimeUpdateResult();for(let e of a)e.numMatches>0&&(this.mappedRealtimeData[e.routeId]=this.mappedRealtimeData[e.routeId]||new Set,this.mappedRealtimeData[e.routeId].add(e.trip))}}var l=r(606);function u(e,t){return Math.floor((t.getTime()-e.unixTime)/864e5)}function p(e,t){return new Date(e.getTime()+864e5*t)}class d{constructor(e,t,r,i,o){this.routeUrlEncoder=e,this.routeInfoStore=t,this.routingInstance=r,this.routingService=i,this.timezoneUtility=o}getStoptime(e,t,r){let i=this.routingInstance.exports.get_stoptime(e,t,r),o=new DataView(this.routingInstance.exports.memory.buffer,i,10);return{departureTime:o.getUint32(0,!0),arrivalTime:o.getUint32(4,!0),delay:o.getInt16(8,!0)}}reconstructTimes(e,t,r){let i=new Date(t.unixTime+1e3*e.departureStopDepartureTime),o=u(t,i);return{plannedDeparture:p(i,r-o),plannedArrival:p(new Date(t.unixTime+1e3*e.arrvialStopArrivalTime),r-o)}}reconstructLeg(e,t,r,i){switch(e.type){case 1:{let r=this.getStoptime(e.routeId,e.departureStopId,e.tripId),i=this.getStoptime(e.routeId,e.arrivalStopId,e.tripId),o=this.reconstructTimes({departureStopDepartureTime:r.departureTime,arrvialStopArrivalTime:i.arrivalTime},t,e.dayOffset);return{type:1,departureStop:this.routeInfoStore.getStop(e.departureStopId),arrivalStop:this.routeInfoStore.getStop(e.arrivalStopId),route:this.routeInfoStore.getRoute(e.routeId),arrivalTime:o.plannedArrival,plannedDeparture:o.plannedDeparture,delay:r.delay,duration:+o.plannedArrival-+o.plannedDeparture,isRealtime:this.routingService.hasRealtime(e.routeId,e.tripId),tripId:e.tripId}}case 0:{let t=this.routingInstance.exports.get_transfer_time(e.departureStopId,e.arrivalStopId);return{type:0,departureStop:this.routeInfoStore.getStop(e.departureStopId),arrivalStop:this.routeInfoStore.getStop(e.arrivalStopId),route:null,tripId:null,plannedDeparture:r,arrivalTime:new Date(+r+1e3*t),delay:i,duration:1e3*t,isRealtime:!1}}}}getRouteByUrl(e){let t=this.routeUrlEncoder.decode(e),r=[],i=t.departureTime,o=this.timezoneUtility.getStartOfDay(t.departureTime),n=0;for(let e of t.legs){let t=this.reconstructLeg(e,o,i,n);r.push(t),i=t.arrivalTime,n=t.delay}return{legs:r}}}var c=r(1673);class m extends Error{constructor(e,t){super(`Data version mismatch - expected ${e}, actual ${t}`),this.expected=e,this.actual=t}}class h{constructor(e,t){this.dataVersion=e,this.timezoneUtility=t,this.UrlVersion=2}getEncodedString(e){return`2${c.DS.fromUint8Array(e,!0)}!${this.dataVersion}`}encode(e){var t;let r=new Uint8Array(5+10*e.legs.filter((e=>1==e.type)).length+5*e.legs.filter((e=>0==e.type)).length),i=new DataView(r.buffer);if(i.setUint8(0,e.legs.length),e.legs.length<1)return this.getEncodedString(r);i.setUint32(1,e.legs.length>0?e.legs[0].plannedDeparture.getTime()/1e3:0,!0);let o=this.timezoneUtility.getStartOfDay(e.legs[0].plannedDeparture),n=5;for(let r of e.legs)i.setUint8(n+0,r.type),i.setUint16(n+1,r.departureStop.stopId,!0),i.setUint16(n+3,r.arrivalStop.stopId,!0),n+=5,1===r.type&&(i.setUint16(n,(null===(t=r.route)||void 0===t?void 0:t.id)||0,!0),i.setUint16(n+2,r.tripId||0,!0),i.setUint8(n+4,u(o,r.plannedDeparture)),n+=5);return this.getEncodedString(r)}decode(e){let t=parseInt(e.substr(0,1));switch(t){case 1:return this.decodeV1(e);case 2:return this.decodeV2(e)}throw new Error(`Unsupported version ${t}`)}decodeV2(e){let[t,r]=e.substr(1).split("!");if(r!==this.dataVersion)throw new m(this.dataVersion,r);let i=c.DS.toUint8Array(t),o=new DataView(i.buffer),n=o.getUint8(0),a=new Date(1e3*o.getUint32(1,!0)),s=[],l=5;for(let e=0;e<n;e++){let e=o.getUint8(l+0),t=o.getUint16(l+1,!0),r=o.getUint16(l+3,!0);if(l+=5,1===e){let i=o.getUint16(l,!0),n=o.getUint16(l+2,!0),a=o.getUint8(l+4);l+=5,s.push({type:e,departureStopId:t,arrivalStopId:r,routeId:i,tripId:n,dayOffset:a})}else s.push({type:e,departureStopId:t,arrivalStopId:r,routeId:null,tripId:null,dayOffset:0})}return{departureTime:a,version:1,legs:s}}decodeV1(e){let[t,r]=e.substr(1).split("!");if(r!==this.dataVersion)throw new m(this.dataVersion,r);let i=c.DS.toUint8Array(t),o=new DataView(i.buffer),n=o.getUint8(0),a=new Date(1e3*o.getUint32(1,!0)),s=[],l=5;for(let e=0;e<n;e++){let e=o.getUint8(l+0),t=o.getUint16(l+1,!0),r=o.getUint16(l+3,!0);if(l+=5,1===e){let i=o.getUint16(l,!0),n=o.getUint16(l+2,!0);l+=4,s.push({type:e,departureStopId:t,arrivalStopId:r,routeId:i,tripId:n,dayOffset:0})}else s.push({type:e,departureStopId:t,arrivalStopId:r,routeId:null,tripId:null,dayOffset:0})}return{departureTime:a,version:1,legs:s}}}class f{constructor(e,t){this.routeInfoStore=e,this.routingService=t,this.lookedUp=[]}hasJustBeenLookedUp(e){return this.lookedUp.some((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value&&(new Date).getTime()-t.when.getTime()<3e4))}setLookedUp(e){let t=this.lookedUp.find((t=>t.rtIdentifier.type==e.type&&t.rtIdentifier.value==e.value));t?t.when=new Date:this.lookedUp.push({rtIdentifier:e,when:new Date})}async performWithRealtimeLoopkup(e){for(let t=0;t<10;t++){let t=await e(),r=[];for(let e of t.reduce(((e,t)=>[...e,this.routeInfoStore.getRealtimeIdentifier(t)]),[]))null===e||this.hasJustBeenLookedUp(e)||r.some((t=>t.type==e.type&&t.value==e.value))||r.push(e);if(0==r.length)break;await this.routingService.updateRealtimeForStops(r);for(let e of r)this.setLookedUp(e)}}}class g{constructor(e){this.sstopGroupIndex=e}getStopGroup(e){if(e>this.sstopGroupIndex.length)throw new Error(`Invalid stop group id ${e}`);return this.sstopGroupIndex[e]}findByStopId(e){let t=this.sstopGroupIndex.find((t=>t.stopIds.includes(e)));return null==t?null:{id:t.stopIds.indexOf(e),name:t.name}}}class y{constructor(e){this.tz=e}getTimezone(){return this.timezone||(this.timezone=(0,l.yQ)(this.tz)),this.timezone}dayOfWeekToMask(e){let t=0;return t=0==e?64:1<<e-1,t}getStartOfDay(e){const t=(0,l.iN)(e,this.getTimezone());return{unixTime:(0,l.ZG)({year:t.year,month:t.month,day:t.day,hours:0,minutes:0,seconds:0},this.getTimezone()),dayOfWeek:this.dayOfWeekToMask(t.dayOfWeek)}}getDateInTimezone(e,t,r,i,o,n){return new Date((0,l.ZG)({year:e,month:t,day:r,hours:i,minutes:o,seconds:n},this.getTimezone()))}}let S,w=null;const v=new class{constructor(){this.dataVersion=new URL(r(717),r.b).toString().split("/").pop().replace(".bmp","")}async createTimezoneUtility(){const{default:e}=await r.e(340).then(r.bind(r,6340));return(0,l.wE)(e),new y("Europe/Vienna")}async getTimezoneUtility(){return null==this.timezoneUtilityPromise&&(this.timezoneUtilityPromise=this.createTimezoneUtility()),this.timezoneUtilityPromise}async createRouteInfoStore(){let e=fetch(new URL(r(9826),r.b).toString()).then((e=>e.json())),t=fetch(new URL(r(3363),r.b).toString()).then((e=>e.json())),i=fetch(new URL(r(2800),r.b).toString()).then((e=>e.json())),n=fetch(new URL(r(6319),r.b).toString()).then((e=>e.json())),[a,s,l,u]=await Promise.all([e,t,i,n]);return new o(a,l,u,s)}async createRoutingInstance(){let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(1645),r.b).toString())),fetch(new URL(r(717),r.b).toString())]);return await i(e.instance,t,11,((e,t)=>e.exports.raptor_allocate(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]))),e.instance.exports.initialize(),e.instance}async getRoutingInstance(){return null==this.routingInstancePromise&&(this.routingInstancePromise=this.createRoutingInstance()),this.routingInstancePromise}async getRouteInfoStore(){return null==this.routeInfoStorePromise&&(this.routeInfoStorePromise=this.createRouteInfoStore()),this.routeInfoStorePromise}async createRoutingService(){let[e,t,r]=await Promise.all([this.getRoutingInstance(),this.getRouteInfoStore(),this.getTimezoneUtility()]);return new s(e,t,r)}async getRoutingService(){return null==this.routingServicePromise&&(this.routingServicePromise=this.createRoutingService()),this.routingServicePromise}async createRouteDetailsService(){let[e,t,r,i]=await Promise.all([this.getRoutingInstance(),this.getRouteInfoStore(),this.getTimezoneUtility(),this.getRoutingService()]);return new d(new h(this.dataVersion,r),t,e,i,r)}async getRouteDetailsService(){return null==this.routeDetailsServicePromise&&(this.routeDetailsServicePromise=this.createRouteDetailsService()),this.routeDetailsServicePromise}async createRealtimeLookupService(){let[e,t]=await Promise.all([this.getRoutingService(),this.getRouteInfoStore()]);return new f(t,e)}async getRealtimeLookupService(){return null==this.realtimeLookupServicePromise&&(this.realtimeLookupServicePromise=this.createRealtimeLookupService()),this.realtimeLookupServicePromise}async createStopGroupStore(){let e=fetch(new URL(r(3369),r.b).toString()).then((e=>e.json()));return new g(await e)}async getStopGroupStore(){return null==this.stopGroupStorePromise&&(this.stopGroupStorePromise=this.createStopGroupStore()),this.stopGroupStorePromise}async createRouteUrlEncoder(){let e=await this.getTimezoneUtility();return new h(this.dataVersion,e)}async getRouteUrlEncoder(){return null==this.routeUrlEncoderPromise&&(this.routeUrlEncoderPromise=this.createRouteUrlEncoder()),this.routeUrlEncoderPromise}};let I="",U={arrivalStopResults:[],departureStopResults:[],results:[],routeDetail:null,departures:[],selectedStopgroups:{departure:null,arrival:null}};function b(e){let t=e(U);U=Object.assign(Object.assign({},U),t),self.postMessage([t,Object.keys(t)])}async function R(e,t){let r=await v.getStopGroupStore();if(null==S)return;let i,o=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(o==I)return;if(o.length==I.length+1&&o.startsWith(I))i=S.exports.stopsearch_step(o.charCodeAt(o.length-1));else{i=S.exports.stopsearch_reset();for(let e=0;e<o.length;e++)i=S.exports.stopsearch_step(o.charCodeAt(e))}I=o;let n=new DataView(S.exports.memory.buffer,i,8),a=n.getUint32(0,!0),s=n.getUint32(4,!0),l=new DataView(S.exports.memory.buffer,s,2*a),u=[];for(let e=0;e<a;e++){let t=l.getUint16(2*e,!0),i=r.getStopGroup(t);u.push({id:t,name:i.name})}b((e=>({[t?"departureStopResults":"arrivalStopResults"]:u})))}let D=Promise.resolve();async function T(){null!=U.selectedStopgroups.arrival&&null!=U.selectedStopgroups.departure?await async function(){let e=await v.getRoutingService(),t=await v.getRealtimeLookupService(),r=await v.getStopGroupStore(),i=r.getStopGroup(U.selectedStopgroups.departure.id).stopIds,o=r.getStopGroup(U.selectedStopgroups.arrival.id).stopIds[0],n=await v.getRouteUrlEncoder();await t.performWithRealtimeLoopkup((async()=>{let t=e.route({arrivalStop:o,departureStops:i,departureTimes:i.map((()=>w))});return b((()=>({results:t.map((e=>({itineraryUrlEncoded:n.encode(e),itinerary:e})))}))),t.reduce(((e,t)=>[...e,...t.legs.map((e=>e.departureStop.stopId))]),[])}))}():null!=U.selectedStopgroups.departure&&(D=(async()=>{b((e=>({results:[]})));let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),i=e.getStopGroup(U.selectedStopgroups.departure.id).stopIds;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:i.map((e=>({departureTime:w,stopId:e})))});return b((()=>({departures:e}))),e.map((e=>e.stop.stopId))}))})(),await D)}async function x(e){var t;if(!(e=e||(null===(t=U.routeDetail)||void 0===t?void 0:t.itineraryUrlEncoded)))return;let r=await v.getRouteDetailsService(),i=await v.getStopGroupStore();(await v.getRealtimeLookupService()).performWithRealtimeLoopkup((async()=>{let t=r.getRouteByUrl(e);return b((()=>({routeDetail:{itineraryUrlEncoded:e,itinerary:t},selectedStopgroups:{departure:i.findByStopId(t.legs[0].departureStop.stopId),arrival:i.findByStopId(t.legs[t.legs.length-1].arrivalStop.stopId)}}))),t.legs.reduce(((e,t)=>[...e,t.departureStop.stopId]),[])}))}self.postMessage([U,Object.keys(U)]),self.addEventListener("message",(e=>{(async function(e){switch(e.type){case 0:await async function(){if(S)return;let[e,t]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(r(7981),r.b).toString())),fetch(new URL(r(4156),r.b).toString())]);await Promise.all([await v.getStopGroupStore(),i(e.instance,t,4,((e,t)=>e.exports.stopsearch_allocate(t[0]/12,t[1],t[3]/2)))]),e.instance.exports.stopsearch_reset(),S=e.instance}();break;case 1:R(e.term,!0);break;case 2:R(e.term,!1);break;case 3:await async function(){await v.getRoutingService()}();break;case 4:await async function(e,t){let r=await v.getStopGroupStore();b((i=>({selectedStopgroups:{departure:null==e?null:{id:e,name:r.getStopGroup(e).name},arrival:null==t?null:{id:t,name:r.getStopGroup(t).name}}}))),w=new Date,await T()}(e.departure,e.arrival);break;case 5:await async function(e){null!=w&&(w=new Date(w.getTime()+e),await T())}(e.increment);break;case 6:await x(e.itineraryUrlEncoded);break;case 7:await async function(){var e;await D,null!=U.selectedStopgroups.departure&&(null===(e=U.departures)||void 0===e?void 0:e.length)>0&&(D=(async()=>{let e=await v.getStopGroupStore(),t=await v.getRoutingService(),r=await v.getRealtimeLookupService(),i=e.getStopGroup(U.selectedStopgroups.departure.id).stopIds,o=U.departures;await r.performWithRealtimeLoopkup((async()=>{let e=t.getDepartures({departureStops:i.map((e=>({departureTime:new Date(o[o.length-1].plannedDeparture.getTime()+o[o.length-1].delay),stopId:e})))}),r=o.findIndex((t=>e.some((e=>t.route.id==e.route.id&&t.tripId==e.tripId&&t.stop.stopId==e.stop.stopId))));return-1!=r&&(r=o.length),b((()=>({departures:[...o.slice(0,r),...e]}))),e.map((e=>e.stop.stopId))}))})())}();break;case 8:await x(null)}})(e.data).catch((e=>console.error(e)))}))},717:function(e,t,r){e.exports=r.p+"data/7fa4c0c6201a586f19da.bmp"},6319:function(e,t,r){e.exports=r.p+"data/341146013d4e4360b611.json"},2800:function(e,t,r){e.exports=r.p+"data/4d9de5f34e6eed76c521.json"},9826:function(e,t,r){e.exports=r.p+"data/67f6d2873901363af326.json"},4156:function(e,t,r){e.exports=r.p+"data/f6821312800bfdef56c2.bmp"},3369:function(e,t,r){e.exports=r.p+"data/c63ea8f4424dbcf844e8.json"},3363:function(e,t,r){e.exports=r.p+"data/fb5a04f9f38a43c78cef.json"},1645:function(e,t,r){e.exports=r.p+"8349f0ed2e30663a2efb.wasm"},7981:function(e,t,r){e.exports=r.p+"351daa55156e49690407.wasm"}},i={};function o(e){var t=i[e];if(void 0!==t)return t.exports;var n=i[e]={exports:{}};return r[e](n,n.exports,o),n.exports}o.m=r,o.x=function(){var e=o.O(void 0,[610],(function(){return o(3468)}));return o.O(e)},e=[],o.O=function(t,r,i,n){if(!r){var a=1/0;for(p=0;p<e.length;p++){r=e[p][0],i=e[p][1],n=e[p][2];for(var s=!0,l=0;l<r.length;l++)(!1&n||a>=n)&&Object.keys(o.O).every((function(e){return o.O[e](r[l])}))?r.splice(l--,1):(s=!1,n<a&&(a=n));if(s){e.splice(p--,1);var u=i();void 0!==u&&(t=u)}}return t}n=n||0;for(var p=e.length;p>0&&e[p-1][2]>n;p--)e[p]=e[p-1];e[p]=[r,i,n]},o.d=function(e,t){for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o.f={},o.e=function(e){return Promise.all(Object.keys(o.f).reduce((function(t,r){return o.f[r](e,t),t}),[]))},o.u=function(e){return{340:"349baa5ee18c799559a0",610:"96e99bd992fa95096738"}[e]+".bundle.js"},o.miniCssF=function(e){},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.p="/",function(){o.b=self.location+"";var e={468:1};o.f.i=function(t,r){e[t]||importScripts(o.p+o.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],r=t.push.bind(t);t.push=function(t){var i=t[0],n=t[1],a=t[2];for(var s in n)o.o(n,s)&&(o.m[s]=n[s]);for(a&&a(o);i.length;)e[i.pop()]=1;r(t)}}(),t=o.x,o.x=function(){return o.e(610).then(t)},o.x()}();
//# sourceMappingURL=55f9fb6fcbc8958ae68c.bundle.js.map