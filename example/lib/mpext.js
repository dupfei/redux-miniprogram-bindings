let t=null;function n(){return t}function e(n){t=n}const o=t=>Object.prototype.toString.call(t),c=t=>"[object Object]"===o(t),s=(t,n)=>Object.prototype.hasOwnProperty.call(t,n),a=t=>"function"==typeof t,i=t=>Object.keys(t)<1;function r(t){if(!c(t))throw new TypeError(`${t}不是一个对象`);const e=n();if(!e)return{};const{storeName:o="$store",mapState:i,mapDispatch:r}=t;let l=null;if(Array.isArray(i)&&i.length>0){const t=e.getState();(l=i.filter(n=>s(t,n))).length<1&&(l=null)}const u=!!l;let f=!1,h={};return c(r)&&Object.keys(r).forEach(t=>{const n=r[t];a(n)&&(f=!0,h[t]=n)}),f||(h=null),{storeName:o,hasMapState:u,ownStateKeys:l,hasMapDispatch:f,ownActionCreators:h}}function l(t,e){const o=n().getState();this.setData({[e]:t.reduce((t,n)=>(t[n]=o[n],t),{})})}const u="[object Object]",f="[object Array]";function h(t,n,e=""){const c=Object.keys(t),a=Object.keys(n),i=c.length,r=a.length;if(!i&&!r)return{};if(!i||!r)return t;const l={};for(let a=0;a<i;a++){const i=c[a],r=t[i],h=e+i;if(!s(n,i)){l[h]=r;continue}const y=n[i];if(r!==y){const t=o(r);t!==o(y)?l[h]=r:t===u?p(r,y,l,h):t===f?d(r,y,l,h):l[h]=r}}return l}function p(t,n,e,c){const a=Object.keys(t),i=Object.keys(n),r=a.length,l=i.length;if(r||l)if(!r||!l||r<l)e[c]=t;else{for(let n=0;n<l;n++){const o=i[n];if(!s(t,o))return void(e[c]=t)}for(let i=0;i<r;i++){const r=a[i],l=t[r],h=`${c}.${r}`;if(!s(n,r)){e[h]=l;continue}const y=n[r];if(l!==y){const t=o(l);t!==o(y)?e[h]=l:t===u?p(l,y,e,h):t===f?d(l,y,e,h):e[h]=l}}}}function d(t,n,e,c){const s=t.length,a=n.length;if(s||a)if(!s||!a||s<a)e[c]=t;else for(let i=0;i<s;i++){const s=t[i],r=`${c}[${i}]`;if(i>=a){e[r]=s;continue}const l=n[i];if(s!==l){const t=o(s);t!==o(l)?e[r]=s:t===u?p(s,l,e,r):t===f?d(s,l,e,r):e[r]=s}}}function y(t,e){const o=n();let c=o.getState();return o.subscribe(()=>{let n=!1;const s=o.getState(),a=t.reduce((t,e)=>(s[e]!==c[e]&&(n=!0,t[e]=s[e]),t),{});if(n){const t=h(a,this.data[e],`${e}.`);i(t)||this.setData(t)}c=s})}function b(t){const{dispatch:e}=n();return Object.keys(t).reduce((n,o)=>{const c=t[o];return n[o]=(...t)=>e(c(...t)),n},{})}function g(t,n){if(!c(t))throw new TypeError(`${t}不是一个对象`);if(i(t)&&a(n))return n();const e=h(t,this.data);i(e)?a(n)&&n():this.setData(e,n)}function j(t={}){const{storeName:e,hasMapState:o,ownStateKeys:c,hasMapDispatch:s,ownActionCreators:i}=r(t);return function(t){const{onLoad:r,onUnload:u}=t,f=!!n();let h=null;return t.onLoad=function(t){f&&o&&(l.call(this,c,e),h=y.call(this,c,e)),r&&r.call(this,t)},t.onUnload=function(){u&&u.call(this),a(h)&&(h(),h=null)},f&&s&&Object.assign(t,b(i)),t.$setData=function(...t){g.apply(this,t)},Page(t)}}function O(t={}){const{storeName:e,hasMapState:o,ownStateKeys:c,hasMapDispatch:s,ownActionCreators:i}=r(t);return function(t){const{attached:r,detached:u}=t,f=!!n();let h=null;return t.attached=function(){f&&o&&(l.call(this,c,e),h=y.call(this,c,e)),r&&r.call(this)},t.detached=function(){u&&u.call(this),a(h)&&(h(),h=null)},t.methods||(t.methods={}),f&&s&&Object.assign(t.methods,b(i)),t.methods.$setData=function(...t){g.apply(this,t)},Component(t)}}export{O as $component,j as $page,n as getStore,e as setStore};
