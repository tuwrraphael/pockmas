!function(){"use strict";var e,t,n={13:function(e,t,n){let r,o;async function a(e,t){let n,r=t.body.getReader(),o=!1,a=[],i=new Uint8Array(16),s=0;for(;!o;){let t=await r.read();if(o=t.done,t.done)break;let c=t.value;if(0==a.length){if(i.set(c.slice(0,Math.min(16-s,c.byteLength)),s),s+=c.byteLength,s<16)continue;{let e=new DataView(i.buffer);for(let t=0;t<4;t++)a.push(e.getUint32(4*t,!0));c=c.slice(16-s)}}a.length>0&&null==n&&(n=e.exports.stopsearch_allocate(a[0]/12,a[1],a[3]/2)),null!=n&&(new Uint8Array(e.exports.memory.buffer,n,c.length).set(c),n+=c.length)}}n(2472),n(3824),n(3948),n(285),n(1637),n(5306),n(8255);let i="",s={results:[]};self.addEventListener("message",(e=>{(async()=>{switch(e.data.type){case"initStopSearch":await async function(){let e=fetch(new URL(n(3369),n.b).toString()).then((e=>e.json())).then((e=>o=e)),[t,i]=await Promise.all([WebAssembly.instantiateStreaming(fetch(new URL(n(7981),n.b).toString())),fetch(new URL(n(3060),n.b).toString())]);await Promise.all([e,a(t.instance,i)]),t.instance.exports.stopsearch_reset(),r=t.instance}();break;case"searchTermChanged":!function(e){if(null==r)return;let t,n=e.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g," ").replace(/ +(?= )/g,"").trim();if(n==i)return;if(n.length==i.length+1)t=r.exports.stopsearch_step(n.charCodeAt(n.length-1));else{t=r.exports.stopsearch_reset();for(let e=0;e<n.length;e++)t=r.exports.stopsearch_step(n.charCodeAt(e))}i=n;let a=new DataView(r.exports.memory.buffer,t,8),c=a.getUint32(0,!0),f=a.getUint32(4,!0),u=new Uint16Array(r.exports.memory.buffer,f,c);s.results=[];for(let e=0;e<c;e++){let t=u[e],n=o[t];s.results.push({id:t,name:n.name})}self.postMessage(s)}(e.data.term)}})().catch(console.error)}))},3060:function(e,t,n){e.exports=n.p+"75bf3fe82c7e343c642f.bin"},3369:function(e,t,n){e.exports=n.p+"0ae9c8f7c1cbe710fabb.json"},7981:function(e,t,n){e.exports=n.p+"dbaccc0306bc5ab33e77.wasm"}},r={};function o(e){var t=r[e];if(void 0!==t)return t.exports;var a=r[e]={exports:{}};return n[e](a,a.exports,o),a.exports}o.m=n,o.x=function(){var e=o.O(void 0,[453,967],(function(){return o(13)}));return o.O(e)},e=[],o.O=function(t,n,r,a){if(!n){var i=1/0;for(u=0;u<e.length;u++){n=e[u][0],r=e[u][1],a=e[u][2];for(var s=!0,c=0;c<n.length;c++)(!1&a||i>=a)&&Object.keys(o.O).every((function(e){return o.O[e](n[c])}))?n.splice(c--,1):(s=!1,a<i&&(i=a));if(s){e.splice(u--,1);var f=r();void 0!==f&&(t=f)}}return t}a=a||0;for(var u=e.length;u>0&&e[u-1][2]>a;u--)e[u]=e[u-1];e[u]=[n,r,a]},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,{a:t}),t},o.d=function(e,t){for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.f={},o.e=function(e){return Promise.all(Object.keys(o.f).reduce((function(t,n){return o.f[n](e,t),t}),[]))},o.u=function(e){return{453:"fd03f84bf37ee1bafe74",967:"ac5666268e29f43b8318"}[e]+".bundle.js"},o.miniCssF=function(e){},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/",function(){o.b=self.location+"";var e={13:1};o.f.i=function(t,n){e[t]||importScripts(o.p+o.u(t))};var t=self.webpackChunkpockmas=self.webpackChunkpockmas||[],n=t.push.bind(t);t.push=function(t){var r=t[0],a=t[1],i=t[2];for(var s in a)o.o(a,s)&&(o.m[s]=a[s]);for(i&&i(o);r.length;)e[r.pop()]=1;n(t)}}(),t=o.x,o.x=function(){return Promise.all([o.e(453),o.e(967)]).then(t)},o.x()}();
//# sourceMappingURL=7299dea915530512a203.bundle.js.map