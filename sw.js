!function(){var t={9662:function(t,e,n){var r=n(614),o=n(6330);t.exports=function(t){if(r(t))return t;throw TypeError(o(t)+" is not a function")}},6077:function(t,e,n){var r=n(614);t.exports=function(t){if("object"==typeof t||r(t))return t;throw TypeError("Can't set "+String(t)+" as a prototype")}},1223:function(t,e,n){var r=n(5112),o=n(30),i=n(3070),c=r("unscopables"),u=Array.prototype;null==u[c]&&i.f(u,c,{configurable:!0,value:o(null)}),t.exports=function(t){u[c][t]=!0}},9670:function(t,e,n){var r=n(111);t.exports=function(t){if(r(t))return t;throw TypeError(String(t)+" is not an object")}},1318:function(t,e,n){var r=n(5656),o=n(1400),i=n(6244),c=function(t){return function(e,n,c){var u,a=r(e),s=i(a),f=o(c,s);if(t&&n!=n){for(;s>f;)if((u=a[f++])!=u)return!0}else for(;s>f;f++)if((t||f in a)&&a[f]===n)return t||f||0;return!t&&-1}};t.exports={includes:c(!0),indexOf:c(!1)}},4326:function(t){var e={}.toString;t.exports=function(t){return e.call(t).slice(8,-1)}},9920:function(t,e,n){var r=n(2597),o=n(3887),i=n(1236),c=n(3070);t.exports=function(t,e){for(var n=o(e),u=c.f,a=i.f,s=0;s<n.length;s++){var f=n[s];r(t,f)||u(t,f,a(e,f))}}},8544:function(t,e,n){var r=n(7293);t.exports=!r((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}))},4994:function(t,e,n){"use strict";var r=n(3383).IteratorPrototype,o=n(30),i=n(9114),c=n(8003),u=n(7497),a=function(){return this};t.exports=function(t,e,n){var s=e+" Iterator";return t.prototype=o(r,{next:i(1,n)}),c(t,s,!1,!0),u[s]=a,t}},8880:function(t,e,n){var r=n(9781),o=n(3070),i=n(9114);t.exports=r?function(t,e,n){return o.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t}},9114:function(t){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},654:function(t,e,n){"use strict";var r=n(2109),o=n(1913),i=n(6530),c=n(614),u=n(4994),a=n(9518),s=n(7674),f=n(8003),p=n(8880),l=n(1320),v=n(5112),y=n(7497),h=n(3383),d=i.PROPER,m=i.CONFIGURABLE,g=h.IteratorPrototype,b=h.BUGGY_SAFARI_ITERATORS,x=v("iterator"),O="keys",w="values",S="entries",j=function(){return this};t.exports=function(t,e,n,i,v,h,T){u(n,e,i);var L,P,E,_=function(t){if(t===v&&k)return k;if(!b&&t in M)return M[t];switch(t){case O:case w:case S:return function(){return new n(this,t)}}return function(){return new n(this)}},A=e+" Iterator",I=!1,M=t.prototype,R=M[x]||M["@@iterator"]||v&&M[v],k=!b&&R||_(v),F="Array"==e&&M.entries||R;if(F&&(L=a(F.call(new t)))!==Object.prototype&&L.next&&(o||a(L)===g||(s?s(L,g):c(L[x])||l(L,x,j)),f(L,A,!0,!0),o&&(y[A]=j)),d&&v==w&&R&&R.name!==w&&(!o&&m?p(M,"name",w):(I=!0,k=function(){return R.call(this)})),v)if(P={values:_(w),keys:h?k:_(O),entries:_(S)},T)for(E in P)(b||I||!(E in M))&&l(M,E,P[E]);else r({target:e,proto:!0,forced:b||I},P);return o&&!T||M[x]===k||l(M,x,k,{name:v}),y[e]=k,P}},9781:function(t,e,n){var r=n(7293);t.exports=!r((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]}))},317:function(t,e,n){var r=n(7854),o=n(111),i=r.document,c=o(i)&&o(i.createElement);t.exports=function(t){return c?i.createElement(t):{}}},8324:function(t){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}},8509:function(t,e,n){var r=n(317)("span").classList,o=r&&r.constructor&&r.constructor.prototype;t.exports=o===Object.prototype?void 0:o},8113:function(t,e,n){var r=n(5005);t.exports=r("navigator","userAgent")||""},7392:function(t,e,n){var r,o,i=n(7854),c=n(8113),u=i.process,a=i.Deno,s=u&&u.versions||a&&a.version,f=s&&s.v8;f?o=(r=f.split("."))[0]<4?1:r[0]+r[1]:c&&(!(r=c.match(/Edge\/(\d+)/))||r[1]>=74)&&(r=c.match(/Chrome\/(\d+)/))&&(o=r[1]),t.exports=o&&+o},748:function(t){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},2109:function(t,e,n){var r=n(7854),o=n(1236).f,i=n(8880),c=n(1320),u=n(3505),a=n(9920),s=n(4705);t.exports=function(t,e){var n,f,p,l,v,y=t.target,h=t.global,d=t.stat;if(n=h?r:d?r[y]||u(y,{}):(r[y]||{}).prototype)for(f in e){if(l=e[f],p=t.noTargetGet?(v=o(n,f))&&v.value:n[f],!s(h?f:y+(d?".":"#")+f,t.forced)&&void 0!==p){if(typeof l==typeof p)continue;a(l,p)}(t.sham||p&&p.sham)&&i(l,"sham",!0),c(n,f,l,t)}}},7293:function(t){t.exports=function(t){try{return!!t()}catch(t){return!0}}},6530:function(t,e,n){var r=n(9781),o=n(2597),i=Function.prototype,c=r&&Object.getOwnPropertyDescriptor,u=o(i,"name"),a=u&&"something"===function(){}.name,s=u&&(!r||r&&c(i,"name").configurable);t.exports={EXISTS:u,PROPER:a,CONFIGURABLE:s}},5005:function(t,e,n){var r=n(7854),o=n(614),i=function(t){return o(t)?t:void 0};t.exports=function(t,e){return arguments.length<2?i(r[t]):r[t]&&r[t][e]}},8173:function(t,e,n){var r=n(9662);t.exports=function(t,e){var n=t[e];return null==n?void 0:r(n)}},7854:function(t,e,n){var r=function(t){return t&&t.Math==Math&&t};t.exports=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof n.g&&n.g)||function(){return this}()||Function("return this")()},2597:function(t,e,n){var r=n(7908),o={}.hasOwnProperty;t.exports=Object.hasOwn||function(t,e){return o.call(r(t),e)}},3501:function(t){t.exports={}},490:function(t,e,n){var r=n(5005);t.exports=r("document","documentElement")},4664:function(t,e,n){var r=n(9781),o=n(7293),i=n(317);t.exports=!r&&!o((function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}))},8361:function(t,e,n){var r=n(7293),o=n(4326),i="".split;t.exports=r((function(){return!Object("z").propertyIsEnumerable(0)}))?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object},2788:function(t,e,n){var r=n(614),o=n(5465),i=Function.toString;r(o.inspectSource)||(o.inspectSource=function(t){return i.call(t)}),t.exports=o.inspectSource},9909:function(t,e,n){var r,o,i,c=n(8536),u=n(7854),a=n(111),s=n(8880),f=n(2597),p=n(5465),l=n(6200),v=n(3501),y="Object already initialized",h=u.WeakMap;if(c||p.state){var d=p.state||(p.state=new h),m=d.get,g=d.has,b=d.set;r=function(t,e){if(g.call(d,t))throw new TypeError(y);return e.facade=t,b.call(d,t,e),e},o=function(t){return m.call(d,t)||{}},i=function(t){return g.call(d,t)}}else{var x=l("state");v[x]=!0,r=function(t,e){if(f(t,x))throw new TypeError(y);return e.facade=t,s(t,x,e),e},o=function(t){return f(t,x)?t[x]:{}},i=function(t){return f(t,x)}}t.exports={set:r,get:o,has:i,enforce:function(t){return i(t)?o(t):r(t,{})},getterFor:function(t){return function(e){var n;if(!a(e)||(n=o(e)).type!==t)throw TypeError("Incompatible receiver, "+t+" required");return n}}}},614:function(t){t.exports=function(t){return"function"==typeof t}},4705:function(t,e,n){var r=n(7293),o=n(614),i=/#|\.prototype\./,c=function(t,e){var n=a[u(t)];return n==f||n!=s&&(o(e)?r(e):!!e)},u=c.normalize=function(t){return String(t).replace(i,".").toLowerCase()},a=c.data={},s=c.NATIVE="N",f=c.POLYFILL="P";t.exports=c},111:function(t,e,n){var r=n(614);t.exports=function(t){return"object"==typeof t?null!==t:r(t)}},1913:function(t){t.exports=!1},2190:function(t,e,n){var r=n(614),o=n(5005),i=n(3307);t.exports=i?function(t){return"symbol"==typeof t}:function(t){var e=o("Symbol");return r(e)&&Object(t)instanceof e}},3383:function(t,e,n){"use strict";var r,o,i,c=n(7293),u=n(614),a=n(30),s=n(9518),f=n(1320),p=n(5112),l=n(1913),v=p("iterator"),y=!1;[].keys&&("next"in(i=[].keys())?(o=s(s(i)))!==Object.prototype&&(r=o):y=!0),null==r||c((function(){var t={};return r[v].call(t)!==t}))?r={}:l&&(r=a(r)),u(r[v])||f(r,v,(function(){return this})),t.exports={IteratorPrototype:r,BUGGY_SAFARI_ITERATORS:y}},7497:function(t){t.exports={}},6244:function(t,e,n){var r=n(7466);t.exports=function(t){return r(t.length)}},133:function(t,e,n){var r=n(7392),o=n(7293);t.exports=!!Object.getOwnPropertySymbols&&!o((function(){var t=Symbol();return!String(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&r&&r<41}))},8536:function(t,e,n){var r=n(7854),o=n(614),i=n(2788),c=r.WeakMap;t.exports=o(c)&&/native code/.test(i(c))},30:function(t,e,n){var r,o=n(9670),i=n(6048),c=n(748),u=n(3501),a=n(490),s=n(317),f=n(6200)("IE_PROTO"),p=function(){},l=function(t){return"<script>"+t+"<\/script>"},v=function(t){t.write(l("")),t.close();var e=t.parentWindow.Object;return t=null,e},y=function(){try{r=new ActiveXObject("htmlfile")}catch(t){}var t,e;y="undefined"!=typeof document?document.domain&&r?v(r):((e=s("iframe")).style.display="none",a.appendChild(e),e.src=String("javascript:"),(t=e.contentWindow.document).open(),t.write(l("document.F=Object")),t.close(),t.F):v(r);for(var n=c.length;n--;)delete y.prototype[c[n]];return y()};u[f]=!0,t.exports=Object.create||function(t,e){var n;return null!==t?(p.prototype=o(t),n=new p,p.prototype=null,n[f]=t):n=y(),void 0===e?n:i(n,e)}},6048:function(t,e,n){var r=n(9781),o=n(3070),i=n(9670),c=n(1956);t.exports=r?Object.defineProperties:function(t,e){i(t);for(var n,r=c(e),u=r.length,a=0;u>a;)o.f(t,n=r[a++],e[n]);return t}},3070:function(t,e,n){var r=n(9781),o=n(4664),i=n(9670),c=n(4948),u=Object.defineProperty;e.f=r?u:function(t,e,n){if(i(t),e=c(e),i(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(t[e]=n.value),t}},1236:function(t,e,n){var r=n(9781),o=n(5296),i=n(9114),c=n(5656),u=n(4948),a=n(2597),s=n(4664),f=Object.getOwnPropertyDescriptor;e.f=r?f:function(t,e){if(t=c(t),e=u(e),s)try{return f(t,e)}catch(t){}if(a(t,e))return i(!o.f.call(t,e),t[e])}},8006:function(t,e,n){var r=n(6324),o=n(748).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},5181:function(t,e){e.f=Object.getOwnPropertySymbols},9518:function(t,e,n){var r=n(2597),o=n(614),i=n(7908),c=n(6200),u=n(8544),a=c("IE_PROTO"),s=Object.prototype;t.exports=u?Object.getPrototypeOf:function(t){var e=i(t);if(r(e,a))return e[a];var n=e.constructor;return o(n)&&e instanceof n?n.prototype:e instanceof Object?s:null}},6324:function(t,e,n){var r=n(2597),o=n(5656),i=n(1318).indexOf,c=n(3501);t.exports=function(t,e){var n,u=o(t),a=0,s=[];for(n in u)!r(c,n)&&r(u,n)&&s.push(n);for(;e.length>a;)r(u,n=e[a++])&&(~i(s,n)||s.push(n));return s}},1956:function(t,e,n){var r=n(6324),o=n(748);t.exports=Object.keys||function(t){return r(t,o)}},5296:function(t,e){"use strict";var n={}.propertyIsEnumerable,r=Object.getOwnPropertyDescriptor,o=r&&!n.call({1:2},1);e.f=o?function(t){var e=r(this,t);return!!e&&e.enumerable}:n},7674:function(t,e,n){var r=n(9670),o=n(6077);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var t,e=!1,n={};try{(t=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),e=n instanceof Array}catch(t){}return function(n,i){return r(n),o(i),e?t.call(n,i):n.__proto__=i,n}}():void 0)},2140:function(t,e,n){var r=n(614),o=n(111);t.exports=function(t,e){var n,i;if("string"===e&&r(n=t.toString)&&!o(i=n.call(t)))return i;if(r(n=t.valueOf)&&!o(i=n.call(t)))return i;if("string"!==e&&r(n=t.toString)&&!o(i=n.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},3887:function(t,e,n){var r=n(5005),o=n(8006),i=n(5181),c=n(9670);t.exports=r("Reflect","ownKeys")||function(t){var e=o.f(c(t)),n=i.f;return n?e.concat(n(t)):e}},1320:function(t,e,n){var r=n(7854),o=n(614),i=n(2597),c=n(8880),u=n(3505),a=n(2788),s=n(9909),f=n(6530).CONFIGURABLE,p=s.get,l=s.enforce,v=String(String).split("String");(t.exports=function(t,e,n,a){var s,p=!!a&&!!a.unsafe,y=!!a&&!!a.enumerable,h=!!a&&!!a.noTargetGet,d=a&&void 0!==a.name?a.name:e;o(n)&&("Symbol("===String(d).slice(0,7)&&(d="["+String(d).replace(/^Symbol\(([^)]*)\)/,"$1")+"]"),(!i(n,"name")||f&&n.name!==d)&&c(n,"name",d),(s=l(n)).source||(s.source=v.join("string"==typeof d?d:""))),t!==r?(p?!h&&t[e]&&(y=!0):delete t[e],y?t[e]=n:c(t,e,n)):y?t[e]=n:u(e,n)})(Function.prototype,"toString",(function(){return o(this)&&p(this).source||a(this)}))},4488:function(t){t.exports=function(t){if(null==t)throw TypeError("Can't call method on "+t);return t}},3505:function(t,e,n){var r=n(7854);t.exports=function(t,e){try{Object.defineProperty(r,t,{value:e,configurable:!0,writable:!0})}catch(n){r[t]=e}return e}},8003:function(t,e,n){var r=n(3070).f,o=n(2597),i=n(5112)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},6200:function(t,e,n){var r=n(2309),o=n(9711),i=r("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},5465:function(t,e,n){var r=n(7854),o=n(3505),i="__core-js_shared__",c=r[i]||o(i,{});t.exports=c},2309:function(t,e,n){var r=n(1913),o=n(5465);(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:"3.18.3",mode:r?"pure":"global",copyright:"© 2021 Denis Pushkarev (zloirock.ru)"})},1400:function(t,e,n){var r=n(9303),o=Math.max,i=Math.min;t.exports=function(t,e){var n=r(t);return n<0?o(n+e,0):i(n,e)}},5656:function(t,e,n){var r=n(8361),o=n(4488);t.exports=function(t){return r(o(t))}},9303:function(t){var e=Math.ceil,n=Math.floor;t.exports=function(t){var r=+t;return r!=r||0===r?0:(r>0?n:e)(r)}},7466:function(t,e,n){var r=n(9303),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},7908:function(t,e,n){var r=n(4488);t.exports=function(t){return Object(r(t))}},7593:function(t,e,n){var r=n(111),o=n(2190),i=n(8173),c=n(2140),u=n(5112)("toPrimitive");t.exports=function(t,e){if(!r(t)||o(t))return t;var n,a=i(t,u);if(a){if(void 0===e&&(e="default"),n=a.call(t,e),!r(n)||o(n))return n;throw TypeError("Can't convert object to primitive value")}return void 0===e&&(e="number"),c(t,e)}},4948:function(t,e,n){var r=n(7593),o=n(2190);t.exports=function(t){var e=r(t,"string");return o(e)?e:String(e)}},6330:function(t){t.exports=function(t){try{return String(t)}catch(t){return"Object"}}},9711:function(t){var e=0,n=Math.random();t.exports=function(t){return"Symbol("+String(void 0===t?"":t)+")_"+(++e+n).toString(36)}},3307:function(t,e,n){var r=n(133);t.exports=r&&!Symbol.sham&&"symbol"==typeof Symbol.iterator},5112:function(t,e,n){var r=n(7854),o=n(2309),i=n(2597),c=n(9711),u=n(133),a=n(3307),s=o("wks"),f=r.Symbol,p=a?f:f&&f.withoutSetter||c;t.exports=function(t){return i(s,t)&&(u||"string"==typeof s[t])||(u&&i(f,t)?s[t]=f[t]:s[t]=p("Symbol."+t)),s[t]}},6992:function(t,e,n){"use strict";var r=n(5656),o=n(1223),i=n(7497),c=n(9909),u=n(654),a="Array Iterator",s=c.set,f=c.getterFor(a);t.exports=u(Array,"Array",(function(t,e){s(this,{type:a,target:r(t),index:0,kind:e})}),(function(){var t=f(this),e=t.target,n=t.kind,r=t.index++;return!e||r>=e.length?(t.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:r,done:!1}:"values"==n?{value:e[r],done:!1}:{value:[r,e[r]],done:!1}}),"values"),i.Arguments=i.Array,o("keys"),o("values"),o("entries")},3948:function(t,e,n){var r=n(7854),o=n(8324),i=n(8509),c=n(6992),u=n(8880),a=n(5112),s=a("iterator"),f=a("toStringTag"),p=c.values,l=function(t,e){if(t){if(t[s]!==p)try{u(t,s,p)}catch(e){t[s]=p}if(t[f]||u(t,f,e),o[e])for(var n in c)if(t[n]!==c[n])try{u(t,n,c[n])}catch(e){t[n]=c[n]}}};for(var v in o)l(r[v]&&r[v].prototype,v);l(i,"DOMTokenList")}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={exports:{}};return t[r](i,i.exports,n),i.exports}n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,{a:e}),e},n.d=function(t,e){for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},function(){"use strict";n(3948);let t={code:"code-".concat("e4c0868ee99eef8940c6210cb571374112a4a71a"),asset:"asset-v1",webfont:"webfont",data:"data-v1"};self.addEventListener("install",(function(e){let n=[{'revision':null,'url':'/20b96d7617b4d35f0be2.bundle.js'},{'revision':null,'url':'/21dda1d42413362ae32c.bmp'},{'revision':null,'url':'/25ba1487fe8f8b80a704.bundle.js'},{'revision':null,'url':'/2c38b2a6c61025d22a81.wasm'},{'revision':null,'url':'/39355cb73e1ddf3c84f6.bundle.js'},{'revision':null,'url':'/757e1aa0deccd624e221.json'},{'revision':null,'url':'/7adae5721eeba2b8f808.wasm'},{'revision':null,'url':'/aca8258eee8d7b804046.bundle.js'},{'revision':null,'url':'/b516fb014e6aab462276.txt'},{'revision':null,'url':'/f6631b00a5be80301ced.json'},{'revision':'9553f19719f79ea63afc927f9ff26238','url':'/favicons/android-chrome-192x192.png'},{'revision':'d74b92f2f61e3c1a1073ef163ba15401','url':'/favicons/android-chrome-512x512.png'},{'revision':'23b3b7bcd64e8657c65d1a694ac8669b','url':'/favicons/apple-touch-icon.png'},{'revision':'a493ba0aa0b8ec8068d786d7248bb92c','url':'/favicons/browserconfig.xml'},{'revision':'831b8f4c38087b53386213f65fd7ab50','url':'/favicons/favicon-16x16.png'},{'revision':'08e430c4775a1ac3a9a23ae26f987fd1','url':'/favicons/favicon-32x32.png'},{'revision':'5f5df2ac0eab2b95aa76701ee66fbe72','url':'/favicons/favicon.ico'},{'revision':'1a6130dbed2dc19bc0fd3c687376660f','url':'/favicons/mstile-144x144.png'},{'revision':'9e8c77022c14dd1c543260c9fcb88fbb','url':'/favicons/mstile-150x150.png'},{'revision':'c84d74c640b8f5ae163833e65b7c0ae7','url':'/favicons/mstile-310x150.png'},{'revision':'506fa0e81db632b650ce2f48f49d0dc5','url':'/favicons/mstile-310x310.png'},{'revision':'c6db4c2c144868030343fcf72b9beaf9','url':'/favicons/mstile-70x70.png'},{'revision':'b9aa277fcfc34c31db6c7a7ea3469b8c','url':'/favicons/site.webmanifest'},{'revision':null,'url':'/fd03f84bf37ee1bafe74.bundle.js'},{'revision':null,'url':'/index.e5b3f1d517fc249773c7.css'},{'revision':'53299e7194aaf59d430c0abaf8ec6028','url':'/index.html'},{'revision':'9ba065049c6f575e501d9aaa6637b297','url':'/licenses.txt'},{'revision':'0d30b53e0e7984b0e83aec3a7f5301f9','url':'/site.webmanifest'}].reduce(((t,e)=>(e.url.indexOf("favicons/")>-1?t.asset.push(e.url):e.url.endsWith(".bmp")||t.code.push(e.url),t)),{asset:[],code:[]}),r=[{name:t.code,assets:[...n.code]},{name:t.asset,assets:n.asset},{name:t.webfont,assets:["https://fonts.googleapis.com/icon?family=Material+Icons","https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap"]}];e.waitUntil((async()=>{let t=r.map((async t=>{let e=await caches.open(t.name);await e.addAll(t.assets)}));await Promise.all(t)})())})),self.addEventListener("activate",(e=>{e.waitUntil((async()=>{let e=await caches.keys(),n=Object.values(t),r=e.filter((t=>n.indexOf(t)<0)).map((async t=>{await caches.delete(t)}));await Promise.all(r)})())})),self.addEventListener("fetch",(function(e){if("navigate"!==e.request.mode)e.respondWith(caches.match(e.request).then((async n=>{if(n)return n;{let n=await fetch(e.request);if(["https://fonts.gstatic.com","https://fonts.googleapis.com"].some((t=>e.request.url.startsWith(t)))){let r=await caches.open(t.webfont);await r.put(e.request,n.clone())}else if(e.request.url.endsWith(".bmp")){let r=await caches.open(t.data);await r.put(e.request,n.clone())}return n}})));else{if("GET"!==e.request.method)return;e.respondWith(caches.match("index.html",{cacheName:t.code}).then((t=>t||fetch(e.request))))}}))}()}();
//# sourceMappingURL=sw.js.map