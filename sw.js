const MIME={html:"text/html; charset=utf-8",css:"text/css",js:"text/javascript",json:"application/json",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",svg:"image/svg+xml",woff2:"font/woff2",woff:"font/woff",pdf:"application/pdf",txt:"text/plain; charset=utf-8",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};
const VER="6228fffa";const BASE=new URL(self.registration.scope).pathname;const OWN=new Set(["sw.js","acceso.html","check.bin","idx.bin"]);
let KEY=null,IDX=null;const PACKS={};const EXP=Date.UTC(2026,10,2,23,0,0);
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open("ifl",1);r.onupgradeneeded=()=>r.result.createObjectStore("k");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function getKey(){if(KEY)return KEY;const db=await idb();return new Promise(res=>{const t=db.transaction("k").objectStore("k").get("key");t.onsuccess=()=>{KEY=t.result||null;res(KEY)};t.onerror=()=>res(null)})}
async function dec(k,b){return crypto.subtle.decrypt({name:"AES-GCM",iv:b.slice(0,12)},k,b.slice(12))}
async function getIdx(k){if(IDX)return IDX;const q=await fetch(BASE+"idx.bin?v="+VER,{cache:"no-cache"});if(!q.ok)throw "net";const b=new Uint8Array(await q.arrayBuffer());IDX=JSON.parse(new TextDecoder().decode(await dec(k,b)));return IDX}
async function getPack(n){if(PACKS[n])return PACKS[n];PACKS[n]=(async()=>{const url=BASE+n+".bin?v="+VER;const c=await caches.open("ifl-"+VER);let r=await c.match(url);if(!r){r=await fetch(url,{cache:"no-cache"});if(!r.ok)throw "net";await c.put(url,r.clone())}return new Uint8Array(await r.arrayBuffer())})();try{return await PACKS[n]}catch(e){delete PACKS[n];throw e}}
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const n of await caches.keys())if(n!=="ifl-"+VER)await caches.delete(n);await self.clients.claim()})()));
self.addEventListener("message",e=>{if(e.data==="forget"){KEY=null;IDX=null}});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=="GET"||!u.pathname.startsWith(BASE))return;
 let rel=decodeURIComponent(u.pathname.slice(BASE.length));if(OWN.has(rel)||/^p[cvd]\d+\.bin$/.test(rel))return;
 e.respondWith((async()=>{if(Date.now()>EXP)return fetch(BASE+"acceso.html");const k=await getKey();if(!k)return fetch(BASE+"acceso.html");
  try{const ix=await getIdx(k);if(rel===""||rel.endsWith("/"))rel+="index.html";if(!ix[rel]&&ix[rel+".html"])rel+=".html";
   const ent=ix[rel];if(!ent)return new Response("No encontrado",{status:404});
   const pk=await getPack(ent[0]);const d=await dec(k,pk.slice(ent[1],ent[1]+ent[2]));
   const ext=(rel.split(".").pop()||"").toLowerCase();return new Response(d,{headers:{"Content-Type":MIME[ext]||"application/octet-stream"}})}
  catch(err){if(err==="net")return new Response('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="5"><p style="font:18px system-ui,sans-serif;margin:4em auto;text-align:center;color:#1b2430">La web se est\u00e1 actualizando. Se volver\u00e1 a cargar sola en unos segundos.</p>',{headers:{"Content-Type":"text/html; charset=utf-8"}});return fetch(BASE+"acceso.html")}})())});
