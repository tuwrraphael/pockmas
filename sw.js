!function(){var t={9662:function(t,e,n){var r=n(7854),o=n(614),i=n(6330),u=r.TypeError;t.exports=function(t){if(o(t))return t;throw u(i(t)+" is not a function")}},6077:function(t,e,n){var r=n(7854),o=n(614),i=r.String,u=r.TypeError;t.exports=function(t){if("object"==typeof t||o(t))return t;throw u("Can't set "+i(t)+" as a prototype")}},1223:function(t,e,n){var r=n(5112),o=n(30),i=n(3070),u=r("unscopables"),c=Array.prototype;null==c[u]&&i.f(c,u,{configurable:!0,value:o(null)}),t.exports=function(t){c[u][t]=!0}},9670:function(t,e,n){var r=n(7854),o=n(111),i=r.String,u=r.TypeError;t.exports=function(t){if(o(t))return t;throw u(i(t)+" is not an object")}},1318:function(t,e,n){var r=n(5656),o=n(1400),i=n(6244),u=function(t){return function(e,n,u){var c,a=r(e),s=i(a),f=o(u,s);if(t&&n!=n){for(;s>f;)if((c=a[f++])!=c)return!0}else for(;s>f;f++)if((t||f in a)&&a[f]===n)return t||f||0;return!t&&-1}};t.exports={includes:u(!0),indexOf:u(!1)}},4326:function(t,e,n){var r=n(1702),o=r({}.toString),i=r("".slice);t.exports=function(t){return i(o(t),8,-1)}},9920:function(t,e,n){var r=n(2597),o=n(3887),i=n(1236),u=n(3070);t.exports=function(t,e){for(var n=o(e),c=u.f,a=i.f,s=0;s<n.length;s++){var f=n[s];r(t,f)||c(t,f,a(e,f))}}},8544:function(t,e,n){var r=n(7293);t.exports=!r((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}))},4994:function(t,e,n){"use strict";var r=n(3383).IteratorPrototype,o=n(30),i=n(9114),u=n(8003),c=n(7497),a=function(){return this};t.exports=function(t,e,n,s){var f=e+" Iterator";return t.prototype=o(r,{next:i(+!s,n)}),u(t,f,!1,!0),c[f]=a,t}},8880:function(t,e,n){var r=n(9781),o=n(3070),i=n(9114);t.exports=r?function(t,e,n){return o.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t}},9114:function(t){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},654:function(t,e,n){"use strict";var r=n(2109),o=n(6916),i=n(1913),u=n(6530),c=n(614),a=n(4994),s=n(9518),f=n(7674),p=n(8003),l=n(8880),v=n(1320),y=n(5112),d=n(7497),h=n(3383),m=u.PROPER,g=u.CONFIGURABLE,b=h.IteratorPrototype,x=h.BUGGY_SAFARI_ITERATORS,O=y("iterator"),w="keys",S="values",j="entries",L=function(){return this};t.exports=function(t,e,n,u,y,h,P){a(n,e,u);var T,E,_,A=function(t){if(t===y&&F)return F;if(!x&&t in M)return M[t];switch(t){case w:case S:case j:return function(){return new n(this,t)}}return function(){return new n(this)}},I=e+" Iterator",k=!1,M=t.prototype,R=M[O]||M["@@iterator"]||y&&M[y],F=!x&&R||A(y),C="Array"==e&&M.entries||R;if(C&&(T=s(C.call(new t)))!==Object.prototype&&T.next&&(i||s(T)===b||(f?f(T,b):c(T[O])||v(T,O,L)),p(T,I,!0,!0),i&&(d[I]=L)),m&&y==S&&R&&R.name!==S&&(!i&&g?l(M,"name",S):(k=!0,F=function(){return o(R,this)})),y)if(E={values:A(S),keys:h?F:A(w),entries:A(j)},P)for(_ in E)(x||k||!(_ in M))&&v(M,_,E[_]);else r({target:e,proto:!0,forced:x||k},E);return i&&!P||M[O]===F||v(M,O,F,{name:y}),d[e]=F,E}},9781:function(t,e,n){var r=n(7293);t.exports=!r((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]}))},317:function(t,e,n){var r=n(7854),o=n(111),i=r.document,u=o(i)&&o(i.createElement);t.exports=function(t){return u?i.createElement(t):{}}},8324:function(t){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}},8509:function(t,e,n){var r=n(317)("span").classList,o=r&&r.constructor&&r.constructor.prototype;t.exports=o===Object.prototype?void 0:o},8113:function(t,e,n){var r=n(5005);t.exports=r("navigator","userAgent")||""},7392:function(t,e,n){var r,o,i=n(7854),u=n(8113),c=i.process,a=i.Deno,s=c&&c.versions||a&&a.version,f=s&&s.v8;f&&(o=(r=f.split("."))[0]>0&&r[0]<4?1:+(r[0]+r[1])),!o&&u&&(!(r=u.match(/Edge\/(\d+)/))||r[1]>=74)&&(r=u.match(/Chrome\/(\d+)/))&&(o=+r[1]),t.exports=o},748:function(t){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},2109:function(t,e,n){var r=n(7854),o=n(1236).f,i=n(8880),u=n(1320),c=n(3505),a=n(9920),s=n(4705);t.exports=function(t,e){var n,f,p,l,v,y=t.target,d=t.global,h=t.stat;if(n=d?r:h?r[y]||c(y,{}):(r[y]||{}).prototype)for(f in e){if(l=e[f],p=t.noTargetGet?(v=o(n,f))&&v.value:n[f],!s(d?f:y+(h?".":"#")+f,t.forced)&&void 0!==p){if(typeof l==typeof p)continue;a(l,p)}(t.sham||p&&p.sham)&&i(l,"sham",!0),u(n,f,l,t)}}},7293:function(t){t.exports=function(t){try{return!!t()}catch(t){return!0}}},6916:function(t){var e=Function.prototype.call;t.exports=e.bind?e.bind(e):function(){return e.apply(e,arguments)}},6530:function(t,e,n){var r=n(9781),o=n(2597),i=Function.prototype,u=r&&Object.getOwnPropertyDescriptor,c=o(i,"name"),a=c&&"something"===function(){}.name,s=c&&(!r||r&&u(i,"name").configurable);t.exports={EXISTS:c,PROPER:a,CONFIGURABLE:s}},1702:function(t){var e=Function.prototype,n=e.bind,r=e.call,o=n&&n.bind(r);t.exports=n?function(t){return t&&o(r,t)}:function(t){return t&&function(){return r.apply(t,arguments)}}},5005:function(t,e,n){var r=n(7854),o=n(614),i=function(t){return o(t)?t:void 0};t.exports=function(t,e){return arguments.length<2?i(r[t]):r[t]&&r[t][e]}},8173:function(t,e,n){var r=n(9662);t.exports=function(t,e){var n=t[e];return null==n?void 0:r(n)}},7854:function(t,e,n){var r=function(t){return t&&t.Math==Math&&t};t.exports=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof n.g&&n.g)||function(){return this}()||Function("return this")()},2597:function(t,e,n){var r=n(1702),o=n(7908),i=r({}.hasOwnProperty);t.exports=Object.hasOwn||function(t,e){return i(o(t),e)}},3501:function(t){t.exports={}},490:function(t,e,n){var r=n(5005);t.exports=r("document","documentElement")},4664:function(t,e,n){var r=n(9781),o=n(7293),i=n(317);t.exports=!r&&!o((function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}))},8361:function(t,e,n){var r=n(7854),o=n(1702),i=n(7293),u=n(4326),c=r.Object,a=o("".split);t.exports=i((function(){return!c("z").propertyIsEnumerable(0)}))?function(t){return"String"==u(t)?a(t,""):c(t)}:c},2788:function(t,e,n){var r=n(1702),o=n(614),i=n(5465),u=r(Function.toString);o(i.inspectSource)||(i.inspectSource=function(t){return u(t)}),t.exports=i.inspectSource},9909:function(t,e,n){var r,o,i,u=n(8536),c=n(7854),a=n(1702),s=n(111),f=n(8880),p=n(2597),l=n(5465),v=n(6200),y=n(3501),d="Object already initialized",h=c.TypeError,m=c.WeakMap;if(u||l.state){var g=l.state||(l.state=new m),b=a(g.get),x=a(g.has),O=a(g.set);r=function(t,e){if(x(g,t))throw new h(d);return e.facade=t,O(g,t,e),e},o=function(t){return b(g,t)||{}},i=function(t){return x(g,t)}}else{var w=v("state");y[w]=!0,r=function(t,e){if(p(t,w))throw new h(d);return e.facade=t,f(t,w,e),e},o=function(t){return p(t,w)?t[w]:{}},i=function(t){return p(t,w)}}t.exports={set:r,get:o,has:i,enforce:function(t){return i(t)?o(t):r(t,{})},getterFor:function(t){return function(e){var n;if(!s(e)||(n=o(e)).type!==t)throw h("Incompatible receiver, "+t+" required");return n}}}},614:function(t){t.exports=function(t){return"function"==typeof t}},4705:function(t,e,n){var r=n(7293),o=n(614),i=/#|\.prototype\./,u=function(t,e){var n=a[c(t)];return n==f||n!=s&&(o(e)?r(e):!!e)},c=u.normalize=function(t){return String(t).replace(i,".").toLowerCase()},a=u.data={},s=u.NATIVE="N",f=u.POLYFILL="P";t.exports=u},111:function(t,e,n){var r=n(614);t.exports=function(t){return"object"==typeof t?null!==t:r(t)}},1913:function(t){t.exports=!1},2190:function(t,e,n){var r=n(7854),o=n(5005),i=n(614),u=n(7976),c=n(3307),a=r.Object;t.exports=c?function(t){return"symbol"==typeof t}:function(t){var e=o("Symbol");return i(e)&&u(e.prototype,a(t))}},3383:function(t,e,n){"use strict";var r,o,i,u=n(7293),c=n(614),a=n(30),s=n(9518),f=n(1320),p=n(5112),l=n(1913),v=p("iterator"),y=!1;[].keys&&("next"in(i=[].keys())?(o=s(s(i)))!==Object.prototype&&(r=o):y=!0),null==r||u((function(){var t={};return r[v].call(t)!==t}))?r={}:l&&(r=a(r)),c(r[v])||f(r,v,(function(){return this})),t.exports={IteratorPrototype:r,BUGGY_SAFARI_ITERATORS:y}},7497:function(t){t.exports={}},6244:function(t,e,n){var r=n(7466);t.exports=function(t){return r(t.length)}},133:function(t,e,n){var r=n(7392),o=n(7293);t.exports=!!Object.getOwnPropertySymbols&&!o((function(){var t=Symbol();return!String(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&r&&r<41}))},8536:function(t,e,n){var r=n(7854),o=n(614),i=n(2788),u=r.WeakMap;t.exports=o(u)&&/native code/.test(i(u))},30:function(t,e,n){var r,o=n(9670),i=n(6048),u=n(748),c=n(3501),a=n(490),s=n(317),f=n(6200)("IE_PROTO"),p=function(){},l=function(t){return"<script>"+t+"<\/script>"},v=function(t){t.write(l("")),t.close();var e=t.parentWindow.Object;return t=null,e},y=function(){try{r=new ActiveXObject("htmlfile")}catch(t){}var t,e;y="undefined"!=typeof document?document.domain&&r?v(r):((e=s("iframe")).style.display="none",a.appendChild(e),e.src=String("javascript:"),(t=e.contentWindow.document).open(),t.write(l("document.F=Object")),t.close(),t.F):v(r);for(var n=u.length;n--;)delete y.prototype[u[n]];return y()};c[f]=!0,t.exports=Object.create||function(t,e){var n;return null!==t?(p.prototype=o(t),n=new p,p.prototype=null,n[f]=t):n=y(),void 0===e?n:i(n,e)}},6048:function(t,e,n){var r=n(9781),o=n(3070),i=n(9670),u=n(5656),c=n(1956);t.exports=r?Object.defineProperties:function(t,e){i(t);for(var n,r=u(e),a=c(e),s=a.length,f=0;s>f;)o.f(t,n=a[f++],r[n]);return t}},3070:function(t,e,n){var r=n(7854),o=n(9781),i=n(4664),u=n(9670),c=n(4948),a=r.TypeError,s=Object.defineProperty;e.f=o?s:function(t,e,n){if(u(t),e=c(e),u(n),i)try{return s(t,e,n)}catch(t){}if("get"in n||"set"in n)throw a("Accessors not supported");return"value"in n&&(t[e]=n.value),t}},1236:function(t,e,n){var r=n(9781),o=n(6916),i=n(5296),u=n(9114),c=n(5656),a=n(4948),s=n(2597),f=n(4664),p=Object.getOwnPropertyDescriptor;e.f=r?p:function(t,e){if(t=c(t),e=a(e),f)try{return p(t,e)}catch(t){}if(s(t,e))return u(!o(i.f,t,e),t[e])}},8006:function(t,e,n){var r=n(6324),o=n(748).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},5181:function(t,e){e.f=Object.getOwnPropertySymbols},9518:function(t,e,n){var r=n(7854),o=n(2597),i=n(614),u=n(7908),c=n(6200),a=n(8544),s=c("IE_PROTO"),f=r.Object,p=f.prototype;t.exports=a?f.getPrototypeOf:function(t){var e=u(t);if(o(e,s))return e[s];var n=e.constructor;return i(n)&&e instanceof n?n.prototype:e instanceof f?p:null}},7976:function(t,e,n){var r=n(1702);t.exports=r({}.isPrototypeOf)},6324:function(t,e,n){var r=n(1702),o=n(2597),i=n(5656),u=n(1318).indexOf,c=n(3501),a=r([].push);t.exports=function(t,e){var n,r=i(t),s=0,f=[];for(n in r)!o(c,n)&&o(r,n)&&a(f,n);for(;e.length>s;)o(r,n=e[s++])&&(~u(f,n)||a(f,n));return f}},1956:function(t,e,n){var r=n(6324),o=n(748);t.exports=Object.keys||function(t){return r(t,o)}},5296:function(t,e){"use strict";var n={}.propertyIsEnumerable,r=Object.getOwnPropertyDescriptor,o=r&&!n.call({1:2},1);e.f=o?function(t){var e=r(this,t);return!!e&&e.enumerable}:n},7674:function(t,e,n){var r=n(1702),o=n(9670),i=n(6077);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var t,e=!1,n={};try{(t=r(Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set))(n,[]),e=n instanceof Array}catch(t){}return function(n,r){return o(n),i(r),e?t(n,r):n.__proto__=r,n}}():void 0)},2140:function(t,e,n){var r=n(7854),o=n(6916),i=n(614),u=n(111),c=r.TypeError;t.exports=function(t,e){var n,r;if("string"===e&&i(n=t.toString)&&!u(r=o(n,t)))return r;if(i(n=t.valueOf)&&!u(r=o(n,t)))return r;if("string"!==e&&i(n=t.toString)&&!u(r=o(n,t)))return r;throw c("Can't convert object to primitive value")}},3887:function(t,e,n){var r=n(5005),o=n(1702),i=n(8006),u=n(5181),c=n(9670),a=o([].concat);t.exports=r("Reflect","ownKeys")||function(t){var e=i.f(c(t)),n=u.f;return n?a(e,n(t)):e}},1320:function(t,e,n){var r=n(7854),o=n(614),i=n(2597),u=n(8880),c=n(3505),a=n(2788),s=n(9909),f=n(6530).CONFIGURABLE,p=s.get,l=s.enforce,v=String(String).split("String");(t.exports=function(t,e,n,a){var s,p=!!a&&!!a.unsafe,y=!!a&&!!a.enumerable,d=!!a&&!!a.noTargetGet,h=a&&void 0!==a.name?a.name:e;o(n)&&("Symbol("===String(h).slice(0,7)&&(h="["+String(h).replace(/^Symbol\(([^)]*)\)/,"$1")+"]"),(!i(n,"name")||f&&n.name!==h)&&u(n,"name",h),(s=l(n)).source||(s.source=v.join("string"==typeof h?h:""))),t!==r?(p?!d&&t[e]&&(y=!0):delete t[e],y?t[e]=n:u(t,e,n)):y?t[e]=n:c(e,n)})(Function.prototype,"toString",(function(){return o(this)&&p(this).source||a(this)}))},4488:function(t,e,n){var r=n(7854).TypeError;t.exports=function(t){if(null==t)throw r("Can't call method on "+t);return t}},3505:function(t,e,n){var r=n(7854),o=Object.defineProperty;t.exports=function(t,e){try{o(r,t,{value:e,configurable:!0,writable:!0})}catch(n){r[t]=e}return e}},8003:function(t,e,n){var r=n(3070).f,o=n(2597),i=n(5112)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},6200:function(t,e,n){var r=n(2309),o=n(9711),i=r("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},5465:function(t,e,n){var r=n(7854),o=n(3505),i="__core-js_shared__",u=r[i]||o(i,{});t.exports=u},2309:function(t,e,n){var r=n(1913),o=n(5465);(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:"3.19.3",mode:r?"pure":"global",copyright:"© 2021 Denis Pushkarev (zloirock.ru)"})},1400:function(t,e,n){var r=n(9303),o=Math.max,i=Math.min;t.exports=function(t,e){var n=r(t);return n<0?o(n+e,0):i(n,e)}},5656:function(t,e,n){var r=n(8361),o=n(4488);t.exports=function(t){return r(o(t))}},9303:function(t){var e=Math.ceil,n=Math.floor;t.exports=function(t){var r=+t;return r!=r||0===r?0:(r>0?n:e)(r)}},7466:function(t,e,n){var r=n(9303),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},7908:function(t,e,n){var r=n(7854),o=n(4488),i=r.Object;t.exports=function(t){return i(o(t))}},7593:function(t,e,n){var r=n(7854),o=n(6916),i=n(111),u=n(2190),c=n(8173),a=n(2140),s=n(5112),f=r.TypeError,p=s("toPrimitive");t.exports=function(t,e){if(!i(t)||u(t))return t;var n,r=c(t,p);if(r){if(void 0===e&&(e="default"),n=o(r,t,e),!i(n)||u(n))return n;throw f("Can't convert object to primitive value")}return void 0===e&&(e="number"),a(t,e)}},4948:function(t,e,n){var r=n(7593),o=n(2190);t.exports=function(t){var e=r(t,"string");return o(e)?e:e+""}},6330:function(t,e,n){var r=n(7854).String;t.exports=function(t){try{return r(t)}catch(t){return"Object"}}},9711:function(t,e,n){var r=n(1702),o=0,i=Math.random(),u=r(1..toString);t.exports=function(t){return"Symbol("+(void 0===t?"":t)+")_"+u(++o+i,36)}},3307:function(t,e,n){var r=n(133);t.exports=r&&!Symbol.sham&&"symbol"==typeof Symbol.iterator},5112:function(t,e,n){var r=n(7854),o=n(2309),i=n(2597),u=n(9711),c=n(133),a=n(3307),s=o("wks"),f=r.Symbol,p=f&&f.for,l=a?f:f&&f.withoutSetter||u;t.exports=function(t){if(!i(s,t)||!c&&"string"!=typeof s[t]){var e="Symbol."+t;c&&i(f,t)?s[t]=f[t]:s[t]=a&&p?p(e):l(e)}return s[t]}},6992:function(t,e,n){"use strict";var r=n(5656),o=n(1223),i=n(7497),u=n(9909),c=n(654),a="Array Iterator",s=u.set,f=u.getterFor(a);t.exports=c(Array,"Array",(function(t,e){s(this,{type:a,target:r(t),index:0,kind:e})}),(function(){var t=f(this),e=t.target,n=t.kind,r=t.index++;return!e||r>=e.length?(t.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:r,done:!1}:"values"==n?{value:e[r],done:!1}:{value:[r,e[r]],done:!1}}),"values"),i.Arguments=i.Array,o("keys"),o("values"),o("entries")},3948:function(t,e,n){var r=n(7854),o=n(8324),i=n(8509),u=n(6992),c=n(8880),a=n(5112),s=a("iterator"),f=a("toStringTag"),p=u.values,l=function(t,e){if(t){if(t[s]!==p)try{c(t,s,p)}catch(e){t[s]=p}if(t[f]||c(t,f,e),o[e])for(var n in u)if(t[n]!==u[n])try{c(t,n,u[n])}catch(e){t[n]=u[n]}}};for(var v in o)l(r[v]&&r[v].prototype,v);l(i,"DOMTokenList")}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={exports:{}};return t[r](i,i.exports,n),i.exports}n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,{a:e}),e},n.d=function(t,e){for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},function(){"use strict";n(3948);let t={code:"code-".concat("05b7e55a749742e64adcfffed6d39a4ec1ae8eca"),asset:"asset-v2",webfont:"webfont-v2",data:"data-v1"},e=[{'revision':null,'url':'/01fa44b6c32d2cc9be0f.bundle.js'},{'revision':null,'url':'/26ab6a2d54186142c915.bundle.js'},{'revision':null,'url':'/355f516c704b4163eba7.svg'},{'revision':null,'url':'/37d4ffaa1ca6a6796a32.bundle.js'},{'revision':null,'url':'/5f3333628a6b3110be24.bundle.js'},{'revision':null,'url':'/7559e08b0ebbe8c2bcd0.wasm'},{'revision':null,'url':'/8e9c9e7956c6c5bf6b4e.wasm'},{'revision':null,'url':'/aca8258eee8d7b804046.bundle.js'},{'revision':null,'url':'/data/49dc8aad3be21f986cdc.json'},{'revision':null,'url':'/data/6b48c0ba998e4eb618bc.bmp'},{'revision':null,'url':'/data/73150152b947cb8dafc9.json'},{'revision':null,'url':'/data/a5e45c391b9b32edd689.json'},{'revision':null,'url':'/data/c4acc6a619c3ab685414.bmp'},{'revision':'9553f19719f79ea63afc927f9ff26238','url':'/favicons/android-chrome-192x192.png'},{'revision':'d74b92f2f61e3c1a1073ef163ba15401','url':'/favicons/android-chrome-512x512.png'},{'revision':'23b3b7bcd64e8657c65d1a694ac8669b','url':'/favicons/apple-touch-icon.png'},{'revision':'a493ba0aa0b8ec8068d786d7248bb92c','url':'/favicons/browserconfig.xml'},{'revision':'831b8f4c38087b53386213f65fd7ab50','url':'/favicons/favicon-16x16.png'},{'revision':'08e430c4775a1ac3a9a23ae26f987fd1','url':'/favicons/favicon-32x32.png'},{'revision':'5f5df2ac0eab2b95aa76701ee66fbe72','url':'/favicons/favicon.ico'},{'revision':'1a6130dbed2dc19bc0fd3c687376660f','url':'/favicons/mstile-144x144.png'},{'revision':'9e8c77022c14dd1c543260c9fcb88fbb','url':'/favicons/mstile-150x150.png'},{'revision':'c84d74c640b8f5ae163833e65b7c0ae7','url':'/favicons/mstile-310x150.png'},{'revision':'506fa0e81db632b650ce2f48f49d0dc5','url':'/favicons/mstile-310x310.png'},{'revision':'c6db4c2c144868030343fcf72b9beaf9','url':'/favicons/mstile-70x70.png'},{'revision':'b9aa277fcfc34c31db6c7a7ea3469b8c','url':'/favicons/site.webmanifest'},{'revision':null,'url':'/index.18240b6ee069d34f664f.css'},{'revision':'ab30b6e8d51bf8205eee22963f40ebaf','url':'/index.html'},{'revision':'dceab595dd6ea6fb23c2c0d70b9e1237','url':'/licenses.txt'},{'revision':'447405fb589c955265d630504960e38c','url':'/site.webmanifest'}];self.addEventListener("install",(function(n){let r=e.reduce(((t,e)=>(e.url.indexOf("favicons/")>-1?t.asset.push(e.url):e.url.includes("data/")||t.code.push(e.url),t)),{asset:[],code:[]}),o=[{name:t.code,assets:[...r.code]},{name:t.asset,assets:r.asset},{name:t.webfont,assets:["https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap"]}];n.waitUntil((async()=>{let t=o.map((async t=>{let e=await caches.open(t.name);await e.addAll(t.assets)}));await Promise.all(t)})())})),self.addEventListener("activate",(n=>{n.waitUntil((async()=>{let n=await caches.keys(),r=Object.values(t),o=n.filter((t=>r.indexOf(t)<0)).map((async t=>{await caches.delete(t)}));await Promise.all(o);let i=await caches.open(t.data),u=await i.keys(),c=e.filter((t=>t.url.includes("data/"))).map((t=>t.url));for(let t of u)c.some((e=>t.url.endsWith(e)))||await i.delete(t)})())})),self.addEventListener("fetch",(function(e){if("navigate"!==e.request.mode)e.respondWith(caches.match(e.request).then((async n=>{if(n)return n;{let n=await fetch(e.request);if(["https://fonts.gstatic.com","https://fonts.googleapis.com"].some((t=>e.request.url.startsWith(t)))){let r=await caches.open(t.webfont);await r.put(e.request,n.clone())}else if(e.request.url.includes("data/")){let r=await caches.open(t.data);await r.put(e.request,n.clone())}return n}})));else{if("GET"!==e.request.method)return;e.respondWith(caches.match("index.html",{cacheName:t.code}).then((t=>t||fetch(e.request))))}})),self.addEventListener("message",(t=>{"skipWaiting"===t.data.action&&self.skipWaiting()}))}()}();
//# sourceMappingURL=sw.js.map