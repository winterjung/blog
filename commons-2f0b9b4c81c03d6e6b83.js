/*! For license information please see commons-2f0b9b4c81c03d6e6b83.js.LICENSE.txt */
(self.webpackChunkblog=self.webpackChunkblog||[]).push([[264],{9416:function(t,n,e){var r=e(3464),o=e(6128),i=function(t){return o(t)[1]},u=function(t){return o(t)[0]},a={baseFontSize:"16px",baseLineHeight:1.5,rhythmUnit:"rem",defaultRhythmBorderWidth:"1px",defaultRhythmBorderStyle:"solid",roundToNearestHalfLine:!0,minLinePadding:"2px"},c=function(t,n){var e,o=r(n.baseFontSize),i=u(o(t,"px")),a=u(n.baseLineHeightInPx),c=u(o(n.minLinePadding,"px"));return(e=n.roundToNearestHalfLine?Math.ceil(2*i/a)/2:Math.ceil(i/a))*a-i<2*c&&(e+=n.roundToNearestHalfLine?.5:1),e},f=function(t){var n=r(t.baseFontSize);return function(e,r,o){null==e&&(e=1),null==r&&(r=t.baseFontSize),null==o&&(o=0);var a=e*u(t.baseLineHeightInPx)-o+"px",c=n(a,t.rhythmUnit,r);return"px"===i(c)&&(c=Math.floor(u(c))+i(c)),parseFloat(u(c).toFixed(5))+i(c)}};t.exports=function(t){var n=JSON.parse(JSON.stringify(a)),e=Object.assign({},n,t),o=r(e.baseFontSize);return i(e.baseLineHeight)?(u(o(e.baseFontSize,"px")),e.baseLineHeightInPx=o(e.baseLineHeight,"px")):e.baseLineHeightInPx=u(e.baseFontSize)*e.baseLineHeight+"px",{rhythm:f(e),establishBaseline:function(){return function(t){return r(t.baseFontSize),{fontSize:u(t.baseFontSize)/16*100+"%",lineHeight:t.baseLineHeight.toString()}}(e)},linesForFontSize:function(t){return c(t,e)},adjustFontSizeTo:function(t,n,o){return null==n&&(n="auto"),function(t,n,e,o){null==e&&(e=o.baseFontSize),"%"===i(t)&&(t=u(o.baseFontSize)*(u(t)/100)+"px");var a=r(o.baseFontSize);t=a(t,"px",e=a(e,"px"));var s=f(o);return"auto"===n&&(n=c(t,o)),{fontSize:a(t,o.rhythmUnit,e),lineHeight:s(n,e)}}(t,n,o,e)}}}},3464:function(t,n,e){var r=e(6128),o=function(t){return r(t)[0]};t.exports=function(t){return function(n,e,i,u){null==i&&(i=t),null==u&&(u=i);var a=function(t){return r(t)[1]}(n);if(a===e)return n;var c=o(n);if("px"!==a)if("em"===a)c=o(n)*o(i);else if("rem"===a)c=o(n)*o(t);else{if("ex"!==a)return n;c=o(n)*o(i)*2}var f=c;if("px"!==e)if("em"===e)f=c/o(u);else if("rem"===e)f=c/o(t);else{if("ex"!==e)return n;f=c/o(u)/2}return parseFloat(f.toFixed(5))+e}}},208:function(t){"use strict";t.exports=function(t,n){if("string"!=typeof t)throw new TypeError("Expected a string");return n=void 0===n?"_":n,t.replace(/([a-z\d])([A-Z])/g,"$1"+n+"$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g,"$1"+n+"$2").toLowerCase()}},160:function(t){"use strict";t.exports=Object.assign},1528:function(t,n,e){"use strict";e.d(n,{c:function(){return u}});var r=e(9088),o=e(2296),i=(e(1504),e(2252));function u(t){let{children:n}=t;const e=(0,o.ch)("3159585216");return(0,r.im)("div",{css:(0,r.gV)("margin:0 auto;max-width:700px;padding:",(0,i.mU)(2),";padding-top:",(0,i.mU)(1.5),";","")},(0,r.im)(o.cH,{to:"/"},(0,r.im)("h2",{css:(0,r.gV)("margin-bottom:",(0,i.mU)(1),";display:inline-block;font-style:normal;","")},e.site.siteMetadata.title),(0,r.im)("hr",null)),n)}},2252:function(t,n,e){"use strict";e.d(n,{mU:function(){return u}});var r=e(9616);const o=new(e.n(r)());o.injectStyles();const{scale:i,rhythm:u,options:a}=o},4576:function(t){function n(t){return!isNaN(parseFloat(t))&&isFinite(t)}t.exports=function(t,e,r){if(void 0===e&&(e=0),void 0===r&&(r=!1),"cool"===e?e=237:"slate"===e?e=122:"warm"===e&&(e=69),!n(e))throw new Error("Hue is not a number");if(!n(t))throw new Error("Lightness is not a number");t>100&&(t=100),t<0&&(t=0);var o=0;if(0!==e){o=19.92978+-.3651759*t+.001737214*Math.pow(t,2)}var i=0;return r?(i=t/100,t="100%,"):(i=(100-t)/100,t="0%,"),"hsla("+e+","+o+"%,"+t+i+")"}},1360:function(t){var n=Object.prototype.toString;t.exports=function(t){return"number"==typeof t||function(t){return!!t&&"object"==typeof t}(t)&&"[object Number]"==n.call(t)}},3651:function(t,n,e){var r=e(7892)(e(7188),"DataView");t.exports=r},1276:function(t,n,e){var r=e(4212),o=e(2688),i=e(3916),u=e(4572),a=e(1016);function c(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}c.prototype.clear=r,c.prototype.delete=o,c.prototype.get=i,c.prototype.has=u,c.prototype.set=a,t.exports=c},660:function(t,n,e){var r=e(5968),o=e(3740),i=e(4996),u=e(2600),a=e(7336);function c(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}c.prototype.clear=r,c.prototype.delete=o,c.prototype.get=i,c.prototype.has=u,c.prototype.set=a,t.exports=c},420:function(t,n,e){var r=e(7892)(e(7188),"Map");t.exports=r},1476:function(t,n,e){var r=e(8720),o=e(4760),i=e(88),u=e(7395),a=e(8619);function c(t){var n=-1,e=null==t?0:t.length;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}c.prototype.clear=r,c.prototype.delete=o,c.prototype.get=i,c.prototype.has=u,c.prototype.set=a,t.exports=c},404:function(t,n,e){var r=e(7892)(e(7188),"Promise");t.exports=r},6920:function(t,n,e){var r=e(7892)(e(7188),"Set");t.exports=r},6152:function(t,n,e){var r=e(1476),o=e(1896),i=e(3504);function u(t){var n=-1,e=null==t?0:t.length;for(this.__data__=new r;++n<e;)this.add(t[n])}u.prototype.add=u.prototype.push=o,u.prototype.has=i,t.exports=u},520:function(t,n,e){var r=e(660),o=e(5643),i=e(3368),u=e(636),a=e(3012),c=e(3388);function f(t){var n=this.__data__=new r(t);this.size=n.size}f.prototype.clear=o,f.prototype.delete=i,f.prototype.get=u,f.prototype.has=a,f.prototype.set=c,t.exports=f},7128:function(t,n,e){var r=e(7188).Symbol;t.exports=r},9704:function(t,n,e){var r=e(7188).Uint8Array;t.exports=r},5200:function(t,n,e){var r=e(7892)(e(7188),"WeakMap");t.exports=r},2253:function(t){t.exports=function(t,n,e){switch(e.length){case 0:return t.call(n);case 1:return t.call(n,e[0]);case 2:return t.call(n,e[0],e[1]);case 3:return t.call(n,e[0],e[1],e[2])}return t.apply(n,e)}},6064:function(t){t.exports=function(t,n){for(var e=-1,r=null==t?0:t.length;++e<r&&!1!==n(t[e],e,t););return t}},8640:function(t){t.exports=function(t,n){for(var e=-1,r=null==t?0:t.length,o=0,i=[];++e<r;){var u=t[e];n(u,e,t)&&(i[o++]=u)}return i}},7640:function(t,n,e){var r=e(736),o=e(348),i=e(2488),u=e(7684),a=e(1188),c=e(6700),f=Object.prototype.hasOwnProperty;t.exports=function(t,n){var e=i(t),s=!e&&o(t),l=!e&&!s&&u(t),p=!e&&!s&&!l&&c(t),h=e||s||l||p,v=h?r(t.length,String):[],d=v.length;for(var b in t)!n&&!f.call(t,b)||h&&("length"==b||l&&("offset"==b||"parent"==b)||p&&("buffer"==b||"byteLength"==b||"byteOffset"==b)||a(b,d))||v.push(b);return v}},2040:function(t){t.exports=function(t,n){for(var e=-1,r=null==t?0:t.length,o=Array(r);++e<r;)o[e]=n(t[e],e,t);return o}},1168:function(t){t.exports=function(t,n){for(var e=-1,r=n.length,o=t.length;++e<r;)t[o+e]=n[e];return t}},7748:function(t){t.exports=function(t,n,e,r){var o=-1,i=null==t?0:t.length;for(r&&i&&(e=t[++o]);++o<i;)e=n(e,t[o],o,t);return e}},5600:function(t){t.exports=function(t,n){for(var e=-1,r=null==t?0:t.length;++e<r;)if(n(t[e],e,t))return!0;return!1}},9200:function(t,n,e){var r=e(6139),o=e(864);t.exports=function(t,n,e){(void 0!==e&&!o(t[n],e)||void 0===e&&!(n in t))&&r(t,n,e)}},8288:function(t,n,e){var r=e(6139),o=e(864),i=Object.prototype.hasOwnProperty;t.exports=function(t,n,e){var u=t[n];i.call(t,n)&&o(u,e)&&(void 0!==e||n in t)||r(t,n,e)}},6600:function(t,n,e){var r=e(864);t.exports=function(t,n){for(var e=t.length;e--;)if(r(t[e][0],n))return e;return-1}},6139:function(t,n,e){var r=e(7792);t.exports=function(t,n,e){"__proto__"==n&&r?r(t,n,{configurable:!0,enumerable:!0,value:e,writable:!0}):t[n]=e}},2471:function(t,n,e){var r=e(8940),o=Object.create,i=function(){function t(){}return function(n){if(!r(n))return{};if(o)return o(n);t.prototype=n;var e=new t;return t.prototype=void 0,e}}();t.exports=i},6032:function(t,n,e){var r=e(316),o=e(9236)(r);t.exports=o},4596:function(t,n,e){var r=e(8168)();t.exports=r},316:function(t,n,e){var r=e(4596),o=e(5160);t.exports=function(t,n){return t&&r(t,n,o)}},4240:function(t,n,e){var r=e(7736),o=e(7668);t.exports=function(t,n){for(var e=0,i=(n=r(n,t)).length;null!=t&&e<i;)t=t[o(n[e++])];return e&&e==i?t:void 0}},4668:function(t,n,e){var r=e(1168),o=e(2488);t.exports=function(t,n,e){var i=n(t);return o(t)?i:r(i,e(t))}},6944:function(t,n,e){var r=e(7128),o=e(5664),i=e(3168),u=r?r.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":u&&u in Object(t)?o(t):i(t)}},7732:function(t){t.exports=function(t,n){return null!=t&&n in Object(t)}},3432:function(t,n,e){var r=e(6944),o=e(2892);t.exports=function(t){return o(t)&&"[object Arguments]"==r(t)}},9184:function(t,n,e){var r=e(4840),o=e(2892);t.exports=function t(n,e,i,u,a){return n===e||(null==n||null==e||!o(n)&&!o(e)?n!=n&&e!=e:r(n,e,i,u,t,a))}},4840:function(t,n,e){var r=e(520),o=e(9124),i=e(2352),u=e(8608),a=e(3871),c=e(2488),f=e(7684),s=e(6700),l="[object Arguments]",p="[object Array]",h="[object Object]",v=Object.prototype.hasOwnProperty;t.exports=function(t,n,e,d,b,g){var y=c(t),x=c(n),m=y?p:a(t),_=x?p:a(n),j=(m=m==l?h:m)==h,w=(_=_==l?h:_)==h,S=m==_;if(S&&f(t)){if(!f(n))return!1;y=!0,j=!1}if(S&&!j)return g||(g=new r),y||s(t)?o(t,n,e,d,b,g):i(t,n,m,e,d,b,g);if(!(1&e)){var O=j&&v.call(t,"__wrapped__"),z=w&&v.call(n,"__wrapped__");if(O||z){var F=O?t.value():t,k=z?n.value():n;return g||(g=new r),b(F,k,e,d,g)}}return!!S&&(g||(g=new r),u(t,n,e,d,b,g))}},7320:function(t,n,e){var r=e(520),o=e(9184);t.exports=function(t,n,e,i){var u=e.length,a=u,c=!i;if(null==t)return!a;for(t=Object(t);u--;){var f=e[u];if(c&&f[2]?f[1]!==t[f[0]]:!(f[0]in t))return!1}for(;++u<a;){var s=(f=e[u])[0],l=t[s],p=f[1];if(c&&f[2]){if(void 0===l&&!(s in t))return!1}else{var h=new r;if(i)var v=i(l,p,s,t,n,h);if(!(void 0===v?o(p,l,3,i,h):v))return!1}}return!0}},7200:function(t,n,e){var r=e(7920),o=e(6084),i=e(8940),u=e(7456),a=/^\[object .+?Constructor\]$/,c=Function.prototype,f=Object.prototype,s=c.toString,l=f.hasOwnProperty,p=RegExp("^"+s.call(l).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");t.exports=function(t){return!(!i(t)||o(t))&&(r(t)?p:a).test(u(t))}},7160:function(t,n,e){var r=e(6944),o=e(9024),i=e(2892),u={};u["[object Float32Array]"]=u["[object Float64Array]"]=u["[object Int8Array]"]=u["[object Int16Array]"]=u["[object Int32Array]"]=u["[object Uint8Array]"]=u["[object Uint8ClampedArray]"]=u["[object Uint16Array]"]=u["[object Uint32Array]"]=!0,u["[object Arguments]"]=u["[object Array]"]=u["[object ArrayBuffer]"]=u["[object Boolean]"]=u["[object DataView]"]=u["[object Date]"]=u["[object Error]"]=u["[object Function]"]=u["[object Map]"]=u["[object Number]"]=u["[object Object]"]=u["[object RegExp]"]=u["[object Set]"]=u["[object String]"]=u["[object WeakMap]"]=!1,t.exports=function(t){return i(t)&&o(t.length)&&!!u[r(t)]}},3968:function(t,n,e){var r=e(4493),o=e(8056),i=e(552),u=e(2488),a=e(4860);t.exports=function(t){return"function"==typeof t?t:null==t?i:"object"==typeof t?u(t)?o(t[0],t[1]):r(t):a(t)}},5552:function(t,n,e){var r=e(1004),o=e(3320),i=Object.prototype.hasOwnProperty;t.exports=function(t){if(!r(t))return o(t);var n=[];for(var e in Object(t))i.call(t,e)&&"constructor"!=e&&n.push(e);return n}},3632:function(t,n,e){var r=e(8940),o=e(1004),i=e(8512),u=Object.prototype.hasOwnProperty;t.exports=function(t){if(!r(t))return i(t);var n=o(t),e=[];for(var a in t)("constructor"!=a||!n&&u.call(t,a))&&e.push(a);return e}},4493:function(t,n,e){var r=e(7320),o=e(3640),i=e(2584);t.exports=function(t){var n=o(t);return 1==n.length&&n[0][2]?i(n[0][0],n[0][1]):function(e){return e===t||r(e,t,n)}}},8056:function(t,n,e){var r=e(9184),o=e(9448),i=e(1256),u=e(9640),a=e(3960),c=e(2584),f=e(7668);t.exports=function(t,n){return u(t)&&a(n)?c(f(t),n):function(e){var u=o(e,t);return void 0===u&&u===n?i(e,t):r(n,u,3)}}},8280:function(t,n,e){var r=e(520),o=e(9200),i=e(4596),u=e(7132),a=e(8940),c=e(2756),f=e(7972);t.exports=function t(n,e,s,l,p){n!==e&&i(e,(function(i,c){if(p||(p=new r),a(i))u(n,e,c,s,t,l,p);else{var h=l?l(f(n,c),i,c+"",n,e,p):void 0;void 0===h&&(h=i),o(n,c,h)}}),c)}},7132:function(t,n,e){var r=e(9200),o=e(1328),i=e(2100),u=e(8416),a=e(6224),c=e(348),f=e(2488),s=e(2480),l=e(7684),p=e(7920),h=e(8940),v=e(308),d=e(6700),b=e(7972),g=e(1824);t.exports=function(t,n,e,y,x,m,_){var j=b(t,e),w=b(n,e),S=_.get(w);if(S)r(t,e,S);else{var O=m?m(j,w,e+"",t,n,_):void 0,z=void 0===O;if(z){var F=f(w),k=!F&&l(w),A=!F&&!k&&d(w);O=w,F||k||A?f(j)?O=j:s(j)?O=u(j):k?(z=!1,O=o(w,!0)):A?(z=!1,O=i(w,!0)):O=[]:v(w)||c(w)?(O=j,c(j)?O=g(j):h(j)&&!p(j)||(O=a(w))):z=!1}z&&(_.set(w,O),x(O,w,y,m,_),_.delete(w)),r(t,e,O)}}},4732:function(t){t.exports=function(t){return function(n){return null==n?void 0:n[t]}}},4184:function(t,n,e){var r=e(4240);t.exports=function(t){return function(n){return r(n,t)}}},6216:function(t){t.exports=function(t,n,e,r,o){return o(t,(function(t,o,i){e=r?(r=!1,t):n(e,t,o,i)})),e}},8292:function(t,n,e){var r=e(552),o=e(8840),i=e(7360);t.exports=function(t,n){return i(o(t,n,r),t+"")}},6040:function(t,n,e){var r=e(8288),o=e(7736),i=e(1188),u=e(8940),a=e(7668);t.exports=function(t,n,e,c){if(!u(t))return t;for(var f=-1,s=(n=o(n,t)).length,l=s-1,p=t;null!=p&&++f<s;){var h=a(n[f]),v=e;if("__proto__"===h||"constructor"===h||"prototype"===h)return t;if(f!=l){var d=p[h];void 0===(v=c?c(d,h,p):void 0)&&(v=u(d)?d:i(n[f+1])?[]:{})}r(p,h,v),p=p[h]}return t}},3120:function(t,n,e){var r=e(6347),o=e(7792),i=e(552),u=o?function(t,n){return o(t,"toString",{configurable:!0,enumerable:!1,value:r(n),writable:!0})}:i;t.exports=u},736:function(t){t.exports=function(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}},6524:function(t,n,e){var r=e(7128),o=e(2040),i=e(2488),u=e(7712),a=r?r.prototype:void 0,c=a?a.toString:void 0;t.exports=function t(n){if("string"==typeof n)return n;if(i(n))return o(n,t)+"";if(u(n))return c?c.call(n):"";var e=n+"";return"0"==e&&1/n==-Infinity?"-0":e}},9165:function(t){t.exports=function(t){return function(n){return t(n)}}},8588:function(t){t.exports=function(t,n){return t.has(n)}},9941:function(t,n,e){var r=e(552);t.exports=function(t){return"function"==typeof t?t:r}},7736:function(t,n,e){var r=e(2488),o=e(9640),i=e(976),u=e(1972);t.exports=function(t,n){return r(t)?t:o(t,n)?[t]:i(u(t))}},5987:function(t,n,e){var r=e(9704);t.exports=function(t){var n=new t.constructor(t.byteLength);return new r(n).set(new r(t)),n}},1328:function(t,n,e){t=e.nmd(t);var r=e(7188),o=n&&!n.nodeType&&n,i=o&&t&&!t.nodeType&&t,u=i&&i.exports===o?r.Buffer:void 0,a=u?u.allocUnsafe:void 0;t.exports=function(t,n){if(n)return t.slice();var e=t.length,r=a?a(e):new t.constructor(e);return t.copy(r),r}},2100:function(t,n,e){var r=e(5987);t.exports=function(t,n){var e=n?r(t.buffer):t.buffer;return new t.constructor(e,t.byteOffset,t.length)}},8416:function(t){t.exports=function(t,n){var e=-1,r=t.length;for(n||(n=Array(r));++e<r;)n[e]=t[e];return n}},7612:function(t,n,e){var r=e(8288),o=e(6139);t.exports=function(t,n,e,i){var u=!e;e||(e={});for(var a=-1,c=n.length;++a<c;){var f=n[a],s=i?i(e[f],t[f],f,e,t):void 0;void 0===s&&(s=t[f]),u?o(e,f,s):r(e,f,s)}return e}},5280:function(t,n,e){var r=e(7188)["__core-js_shared__"];t.exports=r},764:function(t,n,e){var r=e(8292),o=e(4221);t.exports=function(t){return r((function(n,e){var r=-1,i=e.length,u=i>1?e[i-1]:void 0,a=i>2?e[2]:void 0;for(u=t.length>3&&"function"==typeof u?(i--,u):void 0,a&&o(e[0],e[1],a)&&(u=i<3?void 0:u,i=1),n=Object(n);++r<i;){var c=e[r];c&&t(n,c,r,u)}return n}))}},9236:function(t,n,e){var r=e(4900);t.exports=function(t,n){return function(e,o){if(null==e)return e;if(!r(e))return t(e,o);for(var i=e.length,u=n?i:-1,a=Object(e);(n?u--:++u<i)&&!1!==o(a[u],u,a););return e}}},8168:function(t){t.exports=function(t){return function(n,e,r){for(var o=-1,i=Object(n),u=r(n),a=u.length;a--;){var c=u[t?a:++o];if(!1===e(i[c],c,i))break}return n}}},7792:function(t,n,e){var r=e(7892),o=function(){try{var t=r(Object,"defineProperty");return t({},"",{}),t}catch(n){}}();t.exports=o},9124:function(t,n,e){var r=e(6152),o=e(5600),i=e(8588);t.exports=function(t,n,e,u,a,c){var f=1&e,s=t.length,l=n.length;if(s!=l&&!(f&&l>s))return!1;var p=c.get(t),h=c.get(n);if(p&&h)return p==n&&h==t;var v=-1,d=!0,b=2&e?new r:void 0;for(c.set(t,n),c.set(n,t);++v<s;){var g=t[v],y=n[v];if(u)var x=f?u(y,g,v,n,t,c):u(g,y,v,t,n,c);if(void 0!==x){if(x)continue;d=!1;break}if(b){if(!o(n,(function(t,n){if(!i(b,n)&&(g===t||a(g,t,e,u,c)))return b.push(n)}))){d=!1;break}}else if(g!==y&&!a(g,y,e,u,c)){d=!1;break}}return c.delete(t),c.delete(n),d}},2352:function(t,n,e){var r=e(7128),o=e(9704),i=e(864),u=e(9124),a=e(3152),c=e(2060),f=r?r.prototype:void 0,s=f?f.valueOf:void 0;t.exports=function(t,n,e,r,f,l,p){switch(e){case"[object DataView]":if(t.byteLength!=n.byteLength||t.byteOffset!=n.byteOffset)return!1;t=t.buffer,n=n.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=n.byteLength||!l(new o(t),new o(n)));case"[object Boolean]":case"[object Date]":case"[object Number]":return i(+t,+n);case"[object Error]":return t.name==n.name&&t.message==n.message;case"[object RegExp]":case"[object String]":return t==n+"";case"[object Map]":var h=a;case"[object Set]":var v=1&r;if(h||(h=c),t.size!=n.size&&!v)return!1;var d=p.get(t);if(d)return d==n;r|=2,p.set(t,n);var b=u(h(t),h(n),r,f,l,p);return p.delete(t),b;case"[object Symbol]":if(s)return s.call(t)==s.call(n)}return!1}},8608:function(t,n,e){var r=e(1096),o=Object.prototype.hasOwnProperty;t.exports=function(t,n,e,i,u,a){var c=1&e,f=r(t),s=f.length;if(s!=r(n).length&&!c)return!1;for(var l=s;l--;){var p=f[l];if(!(c?p in n:o.call(n,p)))return!1}var h=a.get(t),v=a.get(n);if(h&&v)return h==n&&v==t;var d=!0;a.set(t,n),a.set(n,t);for(var b=c;++l<s;){var g=t[p=f[l]],y=n[p];if(i)var x=c?i(y,g,p,n,t,a):i(g,y,p,t,n,a);if(!(void 0===x?g===y||u(g,y,e,i,a):x)){d=!1;break}b||(b="constructor"==p)}if(d&&!b){var m=t.constructor,_=n.constructor;m==_||!("constructor"in t)||!("constructor"in n)||"function"==typeof m&&m instanceof m&&"function"==typeof _&&_ instanceof _||(d=!1)}return a.delete(t),a.delete(n),d}},4848:function(t,n,e){var r="object"==typeof e.g&&e.g&&e.g.Object===Object&&e.g;t.exports=r},1096:function(t,n,e){var r=e(4668),o=e(3520),i=e(5160);t.exports=function(t){return r(t,i,o)}},6068:function(t,n,e){var r=e(6096);t.exports=function(t,n){var e=t.__data__;return r(n)?e["string"==typeof n?"string":"hash"]:e.map}},3640:function(t,n,e){var r=e(3960),o=e(5160);t.exports=function(t){for(var n=o(t),e=n.length;e--;){var i=n[e],u=t[i];n[e]=[i,u,r(u)]}return n}},7892:function(t,n,e){var r=e(7200),o=e(5692);t.exports=function(t,n){var e=o(t,n);return r(e)?e:void 0}},476:function(t,n,e){var r=e(1304)(Object.getPrototypeOf,Object);t.exports=r},5664:function(t,n,e){var r=e(7128),o=Object.prototype,i=o.hasOwnProperty,u=o.toString,a=r?r.toStringTag:void 0;t.exports=function(t){var n=i.call(t,a),e=t[a];try{t[a]=void 0;var r=!0}catch(c){}var o=u.call(t);return r&&(n?t[a]=e:delete t[a]),o}},3520:function(t,n,e){var r=e(8640),o=e(872),i=Object.prototype.propertyIsEnumerable,u=Object.getOwnPropertySymbols,a=u?function(t){return null==t?[]:(t=Object(t),r(u(t),(function(n){return i.call(t,n)})))}:o;t.exports=a},3871:function(t,n,e){var r=e(3651),o=e(420),i=e(404),u=e(6920),a=e(5200),c=e(6944),f=e(7456),s="[object Map]",l="[object Promise]",p="[object Set]",h="[object WeakMap]",v="[object DataView]",d=f(r),b=f(o),g=f(i),y=f(u),x=f(a),m=c;(r&&m(new r(new ArrayBuffer(1)))!=v||o&&m(new o)!=s||i&&m(i.resolve())!=l||u&&m(new u)!=p||a&&m(new a)!=h)&&(m=function(t){var n=c(t),e="[object Object]"==n?t.constructor:void 0,r=e?f(e):"";if(r)switch(r){case d:return v;case b:return s;case g:return l;case y:return p;case x:return h}return n}),t.exports=m},5692:function(t){t.exports=function(t,n){return null==t?void 0:t[n]}},2828:function(t,n,e){var r=e(7736),o=e(348),i=e(2488),u=e(1188),a=e(9024),c=e(7668);t.exports=function(t,n,e){for(var f=-1,s=(n=r(n,t)).length,l=!1;++f<s;){var p=c(n[f]);if(!(l=null!=t&&e(t,p)))break;t=t[p]}return l||++f!=s?l:!!(s=null==t?0:t.length)&&a(s)&&u(p,s)&&(i(t)||o(t))}},4212:function(t,n,e){var r=e(5604);t.exports=function(){this.__data__=r?r(null):{},this.size=0}},2688:function(t){t.exports=function(t){var n=this.has(t)&&delete this.__data__[t];return this.size-=n?1:0,n}},3916:function(t,n,e){var r=e(5604),o=Object.prototype.hasOwnProperty;t.exports=function(t){var n=this.__data__;if(r){var e=n[t];return"__lodash_hash_undefined__"===e?void 0:e}return o.call(n,t)?n[t]:void 0}},4572:function(t,n,e){var r=e(5604),o=Object.prototype.hasOwnProperty;t.exports=function(t){var n=this.__data__;return r?void 0!==n[t]:o.call(n,t)}},1016:function(t,n,e){var r=e(5604);t.exports=function(t,n){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=r&&void 0===n?"__lodash_hash_undefined__":n,this}},6224:function(t,n,e){var r=e(2471),o=e(476),i=e(1004);t.exports=function(t){return"function"!=typeof t.constructor||i(t)?{}:r(o(t))}},1188:function(t){var n=/^(?:0|[1-9]\d*)$/;t.exports=function(t,e){var r=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&n.test(t))&&t>-1&&t%1==0&&t<e}},4221:function(t,n,e){var r=e(864),o=e(4900),i=e(1188),u=e(8940);t.exports=function(t,n,e){if(!u(e))return!1;var a=typeof n;return!!("number"==a?o(e)&&i(n,e.length):"string"==a&&n in e)&&r(e[n],t)}},9640:function(t,n,e){var r=e(2488),o=e(7712),i=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,u=/^\w*$/;t.exports=function(t,n){if(r(t))return!1;var e=typeof t;return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!o(t))||(u.test(t)||!i.test(t)||null!=n&&t in Object(n))}},6096:function(t){t.exports=function(t){var n=typeof t;return"string"==n||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==t:null===t}},6084:function(t,n,e){var r,o=e(5280),i=(r=/[^.]+$/.exec(o&&o.keys&&o.keys.IE_PROTO||""))?"Symbol(src)_1."+r:"";t.exports=function(t){return!!i&&i in t}},1004:function(t){var n=Object.prototype;t.exports=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||n)}},3960:function(t,n,e){var r=e(8940);t.exports=function(t){return t==t&&!r(t)}},5968:function(t){t.exports=function(){this.__data__=[],this.size=0}},3740:function(t,n,e){var r=e(6600),o=Array.prototype.splice;t.exports=function(t){var n=this.__data__,e=r(n,t);return!(e<0)&&(e==n.length-1?n.pop():o.call(n,e,1),--this.size,!0)}},4996:function(t,n,e){var r=e(6600);t.exports=function(t){var n=this.__data__,e=r(n,t);return e<0?void 0:n[e][1]}},2600:function(t,n,e){var r=e(6600);t.exports=function(t){return r(this.__data__,t)>-1}},7336:function(t,n,e){var r=e(6600);t.exports=function(t,n){var e=this.__data__,o=r(e,t);return o<0?(++this.size,e.push([t,n])):e[o][1]=n,this}},8720:function(t,n,e){var r=e(1276),o=e(660),i=e(420);t.exports=function(){this.size=0,this.__data__={hash:new r,map:new(i||o),string:new r}}},4760:function(t,n,e){var r=e(6068);t.exports=function(t){var n=r(this,t).delete(t);return this.size-=n?1:0,n}},88:function(t,n,e){var r=e(6068);t.exports=function(t){return r(this,t).get(t)}},7395:function(t,n,e){var r=e(6068);t.exports=function(t){return r(this,t).has(t)}},8619:function(t,n,e){var r=e(6068);t.exports=function(t,n){var e=r(this,t),o=e.size;return e.set(t,n),this.size+=e.size==o?0:1,this}},3152:function(t){t.exports=function(t){var n=-1,e=Array(t.size);return t.forEach((function(t,r){e[++n]=[r,t]})),e}},2584:function(t){t.exports=function(t,n){return function(e){return null!=e&&(e[t]===n&&(void 0!==n||t in Object(e)))}}},9032:function(t,n,e){var r=e(1576);t.exports=function(t){var n=r(t,(function(t){return 500===e.size&&e.clear(),t})),e=n.cache;return n}},5604:function(t,n,e){var r=e(7892)(Object,"create");t.exports=r},3320:function(t,n,e){var r=e(1304)(Object.keys,Object);t.exports=r},8512:function(t){t.exports=function(t){var n=[];if(null!=t)for(var e in Object(t))n.push(e);return n}},9180:function(t,n,e){t=e.nmd(t);var r=e(4848),o=n&&!n.nodeType&&n,i=o&&t&&!t.nodeType&&t,u=i&&i.exports===o&&r.process,a=function(){try{var t=i&&i.require&&i.require("util").types;return t||u&&u.binding&&u.binding("util")}catch(n){}}();t.exports=a},3168:function(t){var n=Object.prototype.toString;t.exports=function(t){return n.call(t)}},1304:function(t){t.exports=function(t,n){return function(e){return t(n(e))}}},8840:function(t,n,e){var r=e(2253),o=Math.max;t.exports=function(t,n,e){return n=o(void 0===n?t.length-1:n,0),function(){for(var i=arguments,u=-1,a=o(i.length-n,0),c=Array(a);++u<a;)c[u]=i[n+u];u=-1;for(var f=Array(n+1);++u<n;)f[u]=i[u];return f[n]=e(c),r(t,this,f)}}},7188:function(t,n,e){var r=e(4848),o="object"==typeof self&&self&&self.Object===Object&&self,i=r||o||Function("return this")();t.exports=i},7972:function(t){t.exports=function(t,n){if(("constructor"!==n||"function"!=typeof t[n])&&"__proto__"!=n)return t[n]}},1896:function(t){t.exports=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this}},3504:function(t){t.exports=function(t){return this.__data__.has(t)}},2060:function(t){t.exports=function(t){var n=-1,e=Array(t.size);return t.forEach((function(t){e[++n]=t})),e}},7360:function(t,n,e){var r=e(3120),o=e(4208)(r);t.exports=o},4208:function(t){var n=Date.now;t.exports=function(t){var e=0,r=0;return function(){var o=n(),i=16-(o-r);if(r=o,i>0){if(++e>=800)return arguments[0]}else e=0;return t.apply(void 0,arguments)}}},5643:function(t,n,e){var r=e(660);t.exports=function(){this.__data__=new r,this.size=0}},3368:function(t){t.exports=function(t){var n=this.__data__,e=n.delete(t);return this.size=n.size,e}},636:function(t){t.exports=function(t){return this.__data__.get(t)}},3012:function(t){t.exports=function(t){return this.__data__.has(t)}},3388:function(t,n,e){var r=e(660),o=e(420),i=e(1476);t.exports=function(t,n){var e=this.__data__;if(e instanceof r){var u=e.__data__;if(!o||u.length<199)return u.push([t,n]),this.size=++e.size,this;e=this.__data__=new i(u)}return e.set(t,n),this.size=e.size,this}},976:function(t,n,e){var r=e(9032),o=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,i=/\\(\\)?/g,u=r((function(t){var n=[];return 46===t.charCodeAt(0)&&n.push(""),t.replace(o,(function(t,e,r,o){n.push(r?o.replace(i,"$1"):e||t)})),n}));t.exports=u},7668:function(t,n,e){var r=e(7712);t.exports=function(t){if("string"==typeof t||r(t))return t;var n=t+"";return"0"==n&&1/t==-Infinity?"-0":n}},7456:function(t){var n=Function.prototype.toString;t.exports=function(t){if(null!=t){try{return n.call(t)}catch(e){}try{return t+""}catch(e){}}return""}},6347:function(t){t.exports=function(t){return function(){return t}}},864:function(t){t.exports=function(t,n){return t===n||t!=t&&n!=n}},2376:function(t,n,e){var r=e(6064),o=e(6032),i=e(9941),u=e(2488);t.exports=function(t,n){return(u(t)?r:o)(t,i(n))}},9448:function(t,n,e){var r=e(4240);t.exports=function(t,n,e){var o=null==t?void 0:r(t,n);return void 0===o?e:o}},1256:function(t,n,e){var r=e(7732),o=e(2828);t.exports=function(t,n){return null!=t&&o(t,n,r)}},552:function(t){t.exports=function(t){return t}},348:function(t,n,e){var r=e(3432),o=e(2892),i=Object.prototype,u=i.hasOwnProperty,a=i.propertyIsEnumerable,c=r(function(){return arguments}())?r:function(t){return o(t)&&u.call(t,"callee")&&!a.call(t,"callee")};t.exports=c},2488:function(t){var n=Array.isArray;t.exports=n},4900:function(t,n,e){var r=e(7920),o=e(9024);t.exports=function(t){return null!=t&&o(t.length)&&!r(t)}},2480:function(t,n,e){var r=e(4900),o=e(2892);t.exports=function(t){return o(t)&&r(t)}},7684:function(t,n,e){t=e.nmd(t);var r=e(7188),o=e(6448),i=n&&!n.nodeType&&n,u=i&&t&&!t.nodeType&&t,a=u&&u.exports===i?r.Buffer:void 0,c=(a?a.isBuffer:void 0)||o;t.exports=c},7920:function(t,n,e){var r=e(6944),o=e(8940);t.exports=function(t){if(!o(t))return!1;var n=r(t);return"[object Function]"==n||"[object GeneratorFunction]"==n||"[object AsyncFunction]"==n||"[object Proxy]"==n}},9024:function(t){t.exports=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}},8188:function(t,n,e){var r=e(6944),o=e(2892);t.exports=function(t){return"number"==typeof t||o(t)&&"[object Number]"==r(t)}},8940:function(t){t.exports=function(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}},2892:function(t){t.exports=function(t){return null!=t&&"object"==typeof t}},308:function(t,n,e){var r=e(6944),o=e(476),i=e(2892),u=Function.prototype,a=Object.prototype,c=u.toString,f=a.hasOwnProperty,s=c.call(Object);t.exports=function(t){if(!i(t)||"[object Object]"!=r(t))return!1;var n=o(t);if(null===n)return!0;var e=f.call(n,"constructor")&&n.constructor;return"function"==typeof e&&e instanceof e&&c.call(e)==s}},6384:function(t,n,e){var r=e(6944),o=e(2488),i=e(2892);t.exports=function(t){return"string"==typeof t||!o(t)&&i(t)&&"[object String]"==r(t)}},7712:function(t,n,e){var r=e(6944),o=e(2892);t.exports=function(t){return"symbol"==typeof t||o(t)&&"[object Symbol]"==r(t)}},6700:function(t,n,e){var r=e(7160),o=e(9165),i=e(9180),u=i&&i.isTypedArray,a=u?o(u):r;t.exports=a},5160:function(t,n,e){var r=e(7640),o=e(5552),i=e(4900);t.exports=function(t){return i(t)?r(t):o(t)}},2756:function(t,n,e){var r=e(7640),o=e(3632),i=e(4900);t.exports=function(t){return i(t)?r(t,!0):o(t)}},1576:function(t,n,e){var r=e(1476);function o(t,n){if("function"!=typeof t||null!=n&&"function"!=typeof n)throw new TypeError("Expected a function");var e=function(){var r=arguments,o=n?n.apply(this,r):r[0],i=e.cache;if(i.has(o))return i.get(o);var u=t.apply(this,r);return e.cache=i.set(o,u)||i,u};return e.cache=new(o.Cache||r),e}o.Cache=r,t.exports=o},7060:function(t,n,e){var r=e(8280),o=e(764)((function(t,n,e){r(t,n,e)}));t.exports=o},4860:function(t,n,e){var r=e(4732),o=e(4184),i=e(9640),u=e(7668);t.exports=function(t){return i(t)?r(u(t)):o(t)}},3848:function(t,n,e){var r=e(7748),o=e(6032),i=e(3968),u=e(6216),a=e(2488);t.exports=function(t,n,e){var c=a(t)?r:u,f=arguments.length<3;return c(t,i(n,4),e,f,o)}},2552:function(t,n,e){var r=e(6040);t.exports=function(t,n,e){return null==t?t:r(t,n,e)}},872:function(t){t.exports=function(){return[]}},6448:function(t){t.exports=function(){return!1}},1824:function(t,n,e){var r=e(7612),o=e(2756);t.exports=function(t){return r(t,o(t))}},1972:function(t,n,e){var r=e(6524);t.exports=function(t){return null==t?"":r(t)}},4564:function(t,n,e){var r,o;r=e(1360),o={"minor second":16/15,"major second":9/8,"minor third":1.2,"major third":4/3,"diminished fourth":Math.sqrt(2),"perfect fifth":1.5,"minor sixth":1.6,golden:1.61803398875,phi:1.61803398875,"major sixth":5/3,"minor seventh":16/9,"major seventh":15/8,octave:2,"major tenth":2.5,"major eleventh":8/3,"major twelfth":3,"double octave":4},t.exports=function(t,n){var e;return null==t&&(t=0),null==n&&(n="golden"),e=r(n)?n:null!=o[n]?o[n]:o.golden,Math.pow(e,t)}},6128:function(t){t.exports=function(t,n){n||(n=[0,""]),t=String(t);var e=parseFloat(t,10);return n[0]=e,n[1]=t.match(/[\d.\-\+]*\s*(.*)/)[1]||"",n}},6012:function(t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default="html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block}audio:not([controls]){display:none;height:0}progress{vertical-align:baseline}[hidden],template{display:none}a{background-color:transparent;}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit;font-weight:bolder}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}svg:not(:root){overflow:hidden}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}button,input,optgroup,select,textarea{font:inherit;margin:0}optgroup{font-weight:700}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}"},9616:function(t,n,e){var r=e(160),o=e(9416),i=e(4564),u=e(4576),a=e(2552),c=e(2376),f=e(8188),s=e(6384),l=e(7920),p=e(2488),h=e(7060),v=e(3848),d=e(6012),b=e(208),g=e(8940);function y(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var x=y(r),m=y(o),_=y(i),j=y(u),w=y(a),S=y(c),O=y(f),z=y(s),F=y(l),k=y(p),A=y(h),L=y(v),B=y(d),P=y(b),T=y(g);function M(){return M=Object.assign?Object.assign.bind():function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r])}return t},M.apply(this,arguments)}var H=function(t,n,e){var r;return void 0===t&&(t={}),r=k.default(n)?n:[n],S.default(r,(function(n){S.default(e,(function(e,r){w.default(t,n+"."+r,e)}))})),t},E=["inherit","default","serif","sans-serif","monospace","fantasy","cursive","-apple-system"],W=function(t){return-1!==E.indexOf(t)||t.startsWith("var(")?t:"'"+t+"'"},C=function t(n){return L.default(n,(function(n,e,r){return n+=r+"{",S.default(e,(function(e,r){if(T.default(e)){var o={};o[r]=e,n+=t(o)}else{var i=P.default(r,"-")+":"+e+";";["Webkit","ms","Moz","O"].forEach((function(t){r.slice(0,t.length)===t&&(i="-"+i)})),n+=i}})),n+="}"}),"")},I=function(t,n,e){var r=C(e);return n.includeNormalize&&(r=""+B.default+r),r};t.exports=function(t){var n=x.default({},{baseFontSize:"16px",baseLineHeight:1.45,headerLineHeight:1.1,scaleRatio:2,googleFonts:[],headerFontFamily:["-apple-system","BlinkMacSystemFont","Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue","sans-serif"],bodyFontFamily:["georgia","serif"],headerColor:"inherit",bodyColor:"hsla(0,0%,0%,0.8)",headerWeight:"bold",bodyWeight:"normal",boldWeight:"bold",includeNormalize:!0,blockMarginBottom:1},t),e=m.default(n);return e.scale=function(t){var r=parseInt(n.baseFontSize,10),o=_.default(t,n.scaleRatio)*r+"px";return e.adjustFontSizeTo(o)},M({options:n},e,{createStyles:function(){return this.toString()},toJSON:function(){return function(t,n){var e,r={},o=t.establishBaseline();r=H(r,"html",{font:o.fontSize+"/"+o.lineHeight+" "+n.bodyFontFamily.map(W).join(","),boxSizing:"border-box",overflowY:"scroll"}),r=H(r,["*","*:before","*:after"],{boxSizing:"inherit"}),r=H(r,"body",{color:n.bodyColor,fontFamily:n.bodyFontFamily.map(W).join(","),fontWeight:n.bodyWeight,wordWrap:"break-word",fontKerning:"normal",MozFontFeatureSettings:'"kern", "liga", "clig", "calt"',msFontFeatureSettings:'"kern", "liga", "clig", "calt"',WebkitFontFeatureSettings:'"kern", "liga", "clig", "calt"',fontFeatureSettings:'"kern", "liga", "clig", "calt"'}),r=H(r,"img",{maxWidth:"100%"}),e=O.default(n.blockMarginBottom)?t.rhythm(n.blockMarginBottom):z.default(n.blockMarginBottom)?n.blockMarginBottom:t.rhythm(1),r=H(r,["h1","h2","h3","h4","h5","h6","hgroup","ul","ol","dl","dd","p","figure","pre","table","fieldset","blockquote","form","noscript","iframe","img","hr","address"],{marginLeft:0,marginRight:0,marginTop:0,paddingBottom:0,paddingLeft:0,paddingRight:0,paddingTop:0,marginBottom:e}),r=H(r,"blockquote",{marginRight:t.rhythm(1),marginBottom:e,marginLeft:t.rhythm(1)}),r=H(r,["b","strong","dt","th"],{fontWeight:n.boldWeight}),r=H(r,"hr",{background:j.default(80),border:"none",height:"1px",marginBottom:"calc("+e+" - 1px)"}),r=H(r,["ol","ul"],{listStylePosition:"outside",listStyleImage:"none",marginLeft:t.rhythm(1)}),r=H(r,"li",{marginBottom:"calc("+e+" / 2)"}),r=H(r,["ol li","ul li"],{paddingLeft:0}),r=H(r,["li > ol","li > ul"],{marginLeft:t.rhythm(1),marginBottom:"calc("+e+" / 2)",marginTop:"calc("+e+" / 2)"}),r=H(r,["blockquote *:last-child","li *:last-child","p *:last-child"],{marginBottom:0}),r=H(r,["li > p"],{marginBottom:"calc("+e+" / 2)"}),r=H(r,["code","kbd","pre","samp"],M({},t.adjustFontSizeTo("85%"))),(r=H(r,["abbr","acronym"],{borderBottom:"1px dotted "+j.default(50),cursor:"help"}))["abbr[title]"]={borderBottom:"1px dotted "+j.default(50),cursor:"help",textDecoration:"none"},r=H(r,["table"],M({},t.adjustFontSizeTo(n.baseFontSize),{borderCollapse:"collapse",width:"100%"})),r=H(r,["thead"],{textAlign:"left"}),r=H(r,["td,th"],{textAlign:"left",borderBottom:"1px solid "+j.default(88),fontFeatureSettings:'"tnum"',MozFontFeatureSettings:'"tnum"',msFontFeatureSettings:'"tnum"',WebkitFontFeatureSettings:'"tnum"',paddingLeft:t.rhythm(2/3),paddingRight:t.rhythm(2/3),paddingTop:t.rhythm(.5),paddingBottom:"calc("+t.rhythm(.5)+" - 1px)"}),r=H(r,"th:first-child,td:first-child",{paddingLeft:0}),r=H(r,"th:last-child,td:last-child",{paddingRight:0}),r=H(r,["h1","h2","h3","h4","h5","h6"],{color:n.headerColor,fontFamily:n.headerFontFamily.map(W).join(","),fontWeight:n.headerWeight,textRendering:"optimizeLegibility"});var i=t.scale(1),u=t.scale(.6),a=t.scale(.4),c=t.scale(0),f=t.scale(-.2),s=t.scale(-.3);return S.default([i,u,a,c,f,s],(function(t,e){r=w.default(r,"h"+(e+1)+".fontSize",t.fontSize),r=w.default(r,"h"+(e+1)+".lineHeight",n.headerLineHeight)})),k.default(n.plugins)&&(r=L.default(n.plugins,(function(e,r){return A.default(e,r(t,n,e))}),r)),n.overrideStyles&&F.default(n.overrideStyles)&&(r=A.default(r,n.overrideStyles(t,n,r))),n.overrideThemeStyles&&F.default(n.overrideThemeStyles)&&(r=A.default(r,n.overrideThemeStyles(t,n,r))),r}(e,n)},toString:function(){return I(0,n,this.toJSON())},injectStyles:function(){if("undefined"!=typeof document)if(document.getElementById("typography.js"))document.getElementById("typography.js").innerHTML=this.toString();else{var t=document.createElement("style");t.id="typography.js",t.innerHTML=this.toString();var n=document.head;n.firstChild?n.insertBefore(t,n.firstChild):n.appendChild(t)}}})}}}]);
//# sourceMappingURL=commons-2f0b9b4c81c03d6e6b83.js.map